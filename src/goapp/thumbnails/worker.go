package thumbnails

import (
	"catears/ffs/goapp/cache"
	"catears/ffs/goapp/disks"
	"catears/ffs/goapp/thumbnails/nailers"
	d "catears/ffs/lib/disks"
	filetype "catears/ffs/lib/file-type"
	"catears/ffs/lib/thumbnail"
	"io"
	"io/fs"
	"log"
	"os"
	"path"
	"time"
)

type Unnailer struct {
}

func (*Unnailer) Generate(ctx *nailers.NailerContext) error {
	return nil
}

var movieNailer = &nailers.MovieNailer{}
var imageNailer = &nailers.ImageNailer{}
var audioNailer = &nailers.AudioNailer{}
var theUnnailer nailers.Nailer = &Unnailer{}

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

func walkSingleDiskAndProduceThumbnails(disk d.Disk) {
	diskId := disk.Id()
	err := fs.WalkDir(disk.Fs(), ".", func(fpath string, d fs.DirEntry, err error) error {
		if err != nil {
			return err
		}

		if fpath == "." {
			return nil
		}
		// TODO: Disks are an abstraction to provide the ability for non-physical disks
		// to be present in the disk store. However, ffmpeg integration is based on commands
		// running locally and thus a conflict between non-physical disks and ffmpeg is born.
		// Hmm...
		tempPathFolder, err := cache.ThumbnailsTempFolder.Get()
		if err != nil {
			return err
		}

		replacedPathName := thumbnail.AsThumbnailName(fpath) + ".webp"
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
		ctx.FilePath = fpath
		ctx.TempOutputPath = tempOutputPath
		ctx.TargetDirectory = sub
		ctx.OutputName = replacedPathName
		desc := filetype.NewFileDescription(fpath)
		ftype, err := desc.FileType()
		if err != nil {
			return err
		}

		nailer := theUnnailer
		if ftype == filetype.Audio {
			nailer = audioNailer
		} else if ftype == filetype.Image {
			nailer = imageNailer
		} else if ftype == filetype.Video {
			nailer = movieNailer
		}
		err = nailer.Generate(ctx)

		if err != nil {
			return err
		}

		if ctx.PromoteToParent {
			// TODO: Find a nicer way to do this, possibly delay and handle completely separately
			parentPath := path.Dir(fpath)
			parentThumbnailName := thumbnail.AsThumbnailName(parentPath) + ".webp"
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
	})

	if err != nil {
		log.Printf("Error when generating thumbnails: %s", err)
	}
}

func FindAndProduceThumbnails() {
	disks := disks.DiskStore.AllDisks()
	for _, disk := range disks {
		walkSingleDiskAndProduceThumbnails(disk)
	}
}
