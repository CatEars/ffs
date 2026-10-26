package thumbnails

import (
	"catears/ffs/goapp/disks"
	"catears/ffs/goapp/thumbnails/nailers"
	d "catears/ffs/lib/disks"
	"io/fs"
	"log"
	"path"
	"regexp"
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

func (*Unnailer) Generate(fpath string) error {
	return nil
}

var nailerMap map[fileExtension]nailers.Nailer = make(map[fileExtension]nailers.Nailer)
var theUnnailer nailers.Nailer = &Unnailer{}

func init() {
	movieNailer := &nailers.MovieNailer{}
	imageNailer := &Unnailer{}
	audioNailer := &Unnailer{}
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

func walkSingleDiskAndProductThumbnails(disk d.Disk) {
	err := fs.WalkDir(disk.Fs(), ".", func(fpath string, d fs.DirEntry, err error) error {
		if err != nil {
			return err
		}
		// TODO: Disks are an abstraction to provide the ability for non-physical disks
		// to be present in the disk store. However, ffmpeg integration is based on commands
		// running locally and thus a conflict between non-physical disks and ffmpeg is born.
		// Hmm...
		nailer := getMatchingNailer(fpath)
		return nailer.Generate(fpath)
	})

	log.Printf("Error when generating thumbnails", err)
}

func FindAndProduceThumbnails() {
	disks := disks.DiskStore.AllDisks()
	for _, disk := range disks {
		walkSingleDiskAndProductThumbnails(disk)
	}
}
