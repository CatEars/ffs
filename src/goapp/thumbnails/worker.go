package thumbnails

import (
	"catears/ffs/goapp/cache"
	"catears/ffs/goapp/disks"
	"catears/ffs/goapp/thumbnails/nailers"
	d "catears/ffs/lib/disks"
	filetype "catears/ffs/lib/file-type"
	"catears/ffs/lib/thumbnail"
	"context"
	"io"
	"io/fs"
	"log"
	"os"
	"path"
	"sync"
	"time"
)

type Unnailer struct {
}

func (*Unnailer) Generate(ctx *nailers.NailerContext) error {
	return nil
}

var videoNailer = &nailers.MovieNailer{}
var imageNailer = &nailers.ImageNailer{}
var audioNailer = &nailers.AudioNailer{}
var theUnnailer nailers.Nailer = &Unnailer{}
var numWorkerThreads = 3

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
	diskId   string
	filepath string
}

var prioritizedThumbnailChannel chan thumbnailRequest = make(chan thumbnailRequest)
var normalThumbnailChannel chan thumbnailRequest = make(chan thumbnailRequest)

func thumbnailWorker(ctx context.Context) error {
	doneChan := ctx.Done()
	// Prioritize doneChan and prioritized channel over normal channel
	for {
		select {
		case <-doneChan:
			return nil
		case req := <-prioritizedThumbnailChannel:
			err := produceThumbnail(req)
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
			}
		}
	}
}

func produceThumbnail(req thumbnailRequest) error {
	fpath := req.filepath
	diskId := req.diskId
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

	// TODO: Disks are an abstraction to provide the ability for non-physical disks
	// to be present in the disk store. However, ffmpeg integration is based on commands
	// running locally and thus a conflict between non-physical disks and ffmpeg is born.
	// Hmm...
	// SOLUTION: Use io.Reader/io.Writer and send read file to stdin of ffmpeg, imagemagick
	ctx := nailers.NewNailerContext()
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
		// TODO: Find a nicer way to do this, possibly delay and handle completely separately
		parentPath := path.Dir(fpath)
		parentThumbnailName := thumbnail.AsThumbnailName(parentPath)
		parentThumbnailDir := thumbnail.ResolveThumbnailFolder(cache.ThumbnailsFolder, diskId, parentPath)
		resolvedParentThumbnailDir, err := parentThumbnailDir.Get()
		if err != nil {
			return err
		}
		originalDir, err := ctx.TargetDirectory.Get()
		if err != nil {
			return err
		}

		parentThumbnailPath := path.Join(resolvedParentThumbnailDir, parentThumbnailName)
		sourcePath := path.Join(originalDir, replacedPathName)
		return copyFile(parentThumbnailPath, sourcePath)
	}

	return nil
}

func walkSingleDiskAndProduceThumbnails(disk d.Disk) {
	diskId := disk.Id()
	err := fs.WalkDir(disk.Fs(), ".", func(fpath string, d fs.DirEntry, err error) error {
		if err != nil {
			return err
		}

		if fpath == "." {
			return nil
		}

		normalThumbnailChannel <- thumbnailRequest{
			filepath: fpath,
			diskId:   diskId,
		}
		return nil
	})

	if err != nil {
		log.Printf("Error when generating thumbnails: %s", err)
	}
}

func InitThumbnailThreads(ctx context.Context, numThreads int, wg *sync.WaitGroup) {
	for range numThreads {
		wg.Go(func() {
			thumbnailWorker(ctx)
		})
	}
}

func FindAndProduceThumbnails() {
	disks := disks.DiskStore.AllDisks()
	for _, disk := range disks {
		walkSingleDiskAndProduceThumbnails(disk)
	}
}
