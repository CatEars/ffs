package thumbnails

import (
	"catears/ffs/goapp/cache"
	"catears/ffs/goapp/disks"
	"catears/ffs/goapp/thumbnails/nailers"
	d "catears/ffs/lib/disks"
	"catears/ffs/lib/thumbnail"
	"io/fs"
	"log"
	"os"
	"path"
	"regexp"
	"strings"
	"time"
)

var movieExtNames []string = []string{
	".mp4",
	".m4v",
	".mov",
	".avi",
	".webm",
	".mkv",
	".mpg",
}

var imageExtNames []string = []string{
	".png",
	".jpg",
	".jpeg",
	".tiff",
	".webp",
	".gif",
	".avif",
	".bmp",
	".ico",
	".psd",
}

var audioExtNames []string = []string{
	".mp3",
	".wav",
	".ogg",
	".flac",
	".aac",
	".m4a",
	".opus",
	".wma",
	".ape",
}

type fileExtension string

type Unnailer struct {
}

func (*Unnailer) Generate(ctx nailers.NailerContext) error {
	return nil
}

var nailerMap map[fileExtension]nailers.Nailer = make(map[fileExtension]nailers.Nailer)
var theUnnailer nailers.Nailer = &Unnailer{}

func init() {
	movieNailer := &nailers.MovieNailer{}
	imageNailer := &nailers.ImageNailer{}
	audioNailer := &nailers.AudioNailer{}
	for _, movieExt := range movieExtNames {
		nailerMap[fileExtension(movieExt)] = movieNailer
	}
	for _, imageExt := range imageExtNames {
		nailerMap[fileExtension(imageExt)] = imageNailer
	}
	for _, audioExt := range audioExtNames {
		nailerMap[fileExtension(audioExt)] = audioNailer
	}
}

var extensionCapturer *regexp.Regexp = regexp.MustCompile(`\.[a-zA-Z0-9]+$`)

func getMatchingNailer(fpath string) nailers.Nailer {
	fileName := path.Base(fpath)
	foundString := strings.ToLower(extensionCapturer.FindString(fileName))
	nailer, found := nailerMap[fileExtension(foundString)]
	if found {
		return nailer
	}
	return theUnnailer
}

// TODO: Test cases with UPPER CASE extension and names

// TODO: Only run nailers if dependencies exist

// TODO: Decide on a good level for thumbnail staleness
var isOldThumbnailDuration time.Duration = time.Hour * 24 * 3

func isStale(t time.Time) bool {
	return t.Before(time.Now().Add(-isOldThumbnailDuration))
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

		ctx := nailers.NailerContext{
			FilePath:        fpath,
			TempOutputPath:  tempOutputPath,
			TargetDirectory: sub,
			OutputName:      replacedPathName,
		}

		nailer := getMatchingNailer(fpath)
		return nailer.Generate(ctx)
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
