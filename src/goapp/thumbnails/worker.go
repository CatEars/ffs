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
	foundString := extensionCapturer.FindString(fileName)
	nailer, found := nailerMap[fileExtension(foundString)]
	if found {
		return nailer
	}
	return theUnnailer
}

var isOldThumbnailDuration time.Duration = time.Minute * 15

func walkSingleDiskAndProductThumbnails(disk d.Disk) {
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

		replacedPathName := thumbnail.AsThumbnailName(fpath)
		tempOutputPath := path.Join(tempPathFolder, replacedPathName)
		log.Printf("%s", fpath)
		sub := thumbnail.ResolveThumbnailFolder(cache.ThumbnailsFolder, fpath)
		thumbnailFolder, err := sub.Get()
		if err != nil {
			return err
		}

		target := path.Join(thumbnailFolder, replacedPathName+".webp")

		existing, err := os.Stat(target)
		if err == nil && existing.ModTime().After(time.Now().Add(-isOldThumbnailDuration)) {
			// thumbnail exists, lets skip making it.
			return nil
		}

		ctx := nailers.NailerContext{
			FilePath:       fpath,
			TempOutputPath: tempOutputPath,
			TargetPath:     target,
		}

		nailer := getMatchingNailer(fpath)
		err = nailer.Generate(ctx)
		if err != nil {
			return err
		}

		log.Printf("Created thumbnail for %s", path.Base(fpath))
		return nil
	})

	if err != nil {
		log.Printf("Error when generating thumbnails", err)
	}
}

func FindAndProduceThumbnails() {
	disks := disks.DiskStore.AllDisks()
	for _, disk := range disks {
		walkSingleDiskAndProductThumbnails(disk)
	}
}
