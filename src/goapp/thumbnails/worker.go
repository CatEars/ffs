package thumbnails

import (
	"catears/ffs/goapp/cache"
	"catears/ffs/goapp/disks"
	"catears/ffs/goapp/thumbnails/nailers"
	"catears/ffs/lib/autofolder"
	d "catears/ffs/lib/disks"
	"catears/ffs/lib/ffslog"
	filetype "catears/ffs/lib/file-type"
	"catears/ffs/lib/thumbnail"
	"context"
	"io"
	"io/fs"
	"os"
	"path"
	"time"
)

type Unnailer struct {
}

func (*Unnailer) Generate(ctx *nailers.NailerContext) error {
	return nil
}

var logger = ffslog.FindOrCreateLogger("Thumbnail")
var videoNailer = &nailers.MovieNailer{}
var imageNailer = &nailers.ImageNailer{}
var audioNailer = &nailers.AudioNailer{}
var theUnnailer nailers.Nailer = &Unnailer{}

// TODO: Remove thumbnails that no longer link to a file ("garbage collection")

// TODO: Only run nailers if dependencies exist

// TODO: Decide on a good level for thumbnail staleness
var isOldThumbnailDuration time.Duration = time.Hour * 24 * 3

func isStale(t time.Time) bool {
	return t.Before(time.Now().Add(-isOldThumbnailDuration))
}

func copyFile(destination, source string) error {
	destFile, err := os.Create(destination)
	if err != nil {
		return err
	}
	defer destFile.Close()

	srcFile, err := os.Open(source)
	if err != nil {
		return err
	}
	defer srcFile.Close()

	_, err = io.Copy(destFile, srcFile)
	return err
}

func selectNailer(ftype filetype.FileType) nailers.Nailer {
	if ftype == filetype.Audio {
		return audioNailer
	} else if ftype == filetype.Image {
		return imageNailer
	} else if ftype == filetype.Video {
		return videoNailer
	}
	return theUnnailer
}

type thumbnailRequest struct {
	disk     d.Disk
	filepath string
}

type promotionRequest struct {
	filepath        string
	diskId          string
	targetDirectory autofolder.AutoFolder
}

var prioritizedThumbnailChannel chan thumbnailRequest = make(chan thumbnailRequest, 100)
var normalThumbnailChannel chan thumbnailRequest = make(chan thumbnailRequest, 10)
var promotionThumbnailChannel chan promotionRequest = make(chan promotionRequest, 100)

func ThumbnailWorkerThread(ctx context.Context) error {
	doneChan := ctx.Done()
	// Prioritize doneChan and prioritized channel over normal channel
	maxLoops := 1000
	loops := 0
	for {
		select {
		case <-doneChan:
			return nil
		case req := <-prioritizedThumbnailChannel:
			err := produceThumbnail(req)
			if err != nil {
				return err
			}
		// Ensure that promotion takes precedence over "normal" so that a full promotion
		// queue does not deadlock thumbnail creation
		case req := <-promotionThumbnailChannel:
			err := promoteThumbnail(req)
			if err != nil {
				return err
			}
		default:
			select {
			case <-doneChan:
				return nil
			case req := <-prioritizedThumbnailChannel:
				err := produceThumbnail(req)
				if err != nil {
					return err
				}
			case req := <-normalThumbnailChannel:
				err := produceThumbnail(req)
				if err != nil {
					return err
				}
			case req := <-promotionThumbnailChannel:
				err := promoteThumbnail(req)
				if err != nil {
					return err
				}
			case <-time.After(time.Second * 5):
				// Intentionally left empty
			}
		}
		loops += 1
		if loops > maxLoops {
			return nil
		}
	}
}

func promoteThumbnail(req promotionRequest) error {
	replacedPathName := thumbnail.AsThumbnailName(req.filepath)
	parentPath := path.Dir(req.filepath)
	parentThumbnailName := thumbnail.AsThumbnailName(parentPath)
	parentThumbnailDir := thumbnail.ResolveThumbnailFolder(cache.ThumbnailsFolder, req.diskId, parentPath)
	resolvedParentThumbnailDir, err := parentThumbnailDir.Get()
	if err != nil {
		return err
	}
	originalDir, err := req.targetDirectory.Get()
	if err != nil {
		return err
	}

	parentThumbnailPath := path.Join(resolvedParentThumbnailDir, parentThumbnailName)
	existing, err := os.Stat(parentThumbnailPath)
	if err == nil && !isStale(existing.ModTime()) {
		// TODO: parent already exists, write test case to ensure promotion only happens once
		return nil
	}
	sourcePath := path.Join(originalDir, replacedPathName)
	err = copyFile(parentThumbnailPath, sourcePath)
	if err != nil {
		return err
	}

	logger.Debugf("Promoted thumbnail %s to directory %s", path.Base(req.filepath), path.Base(path.Dir(req.filepath)))
	return nil
}

func produceThumbnail(req thumbnailRequest) error {
	fpath := req.filepath
	diskId := req.disk.Id()
	tempPathFolder, err := cache.ThumbnailsTempFolder.Get()
	if err != nil {
		return err
	}

	replacedPathName := thumbnail.AsThumbnailName(fpath)
	tempOutputPath := path.Join(tempPathFolder, replacedPathName)
	sub := thumbnail.ResolveThumbnailFolder(cache.ThumbnailsFolder, diskId, fpath)
	thumbnailFolder := sub.Peek()

	target := path.Join(thumbnailFolder, replacedPathName)

	existingThumbnail, err := os.Stat(target)
	if err == nil && !isStale(existingThumbnail.ModTime()) {
		// thumbnail exists, and was newly generated, lets skip making it.
		return nil
	}

	ctx := nailers.NewNailerContext()
	ctx.Disk = req.disk
	ctx.FilePath = fpath
	ctx.TempOutputPath = tempOutputPath
	ctx.TargetDirectory = sub
	ctx.OutputName = replacedPathName
	desc := filetype.NewFileDescription(fpath)
	ftype, err := desc.FileType()
	if err != nil {
		return err
	}

	nailer := selectNailer(ftype)
	err = nailer.Generate(ctx)

	if err != nil {
		return err
	}

	if ctx.PromoteToParent {
		promotionThumbnailChannel <- promotionRequest{
			filepath:        fpath,
			diskId:          diskId,
			targetDirectory: ctx.TargetDirectory,
		}
	}

	return nil
}

func walkSingleDiskAndProduceThumbnails(ctx context.Context, disk d.Disk) {
	err := fs.WalkDir(disk.Fs(), ".", func(fpath string, d fs.DirEntry, err error) error {
		if err != nil {
			return err
		}

		if fpath == "." {
			return nil
		}

		select {
		case <-ctx.Done():
			return nil
		default:
			normalThumbnailChannel <- thumbnailRequest{
				filepath: fpath,
				disk:     disk,
			}
			return nil
		}
	})

	if err != nil {
		logger.Warnf("Error when generating thumbnails: %s", err)
	}
}

func PrioritizeThumbnail(disk d.Disk, filepath string) {
	req := thumbnailRequest{
		disk:     disk,
		filepath: filepath,
	}

	// Shed load rather than wait if too many requests come in at the same time
	select {
	case prioritizedThumbnailChannel <- req:
		break
	default:
		break
	}
}

func FindAndProduceThumbnails(ctx context.Context) {
	disks := disks.DiskStore.AllDisks()
	for _, disk := range disks {
		select {
		case <-ctx.Done():
			return
		default:
			walkSingleDiskAndProduceThumbnails(ctx, disk)
		}
	}
}
