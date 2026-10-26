package nailers

import (
	"catears/ffs/goapp/cache"
	"catears/ffs/lib/thumbnail"
	"errors"
	"fmt"
	"log"
	"os"
	"os/exec"
	"path"
	"strconv"
	"strings"
)

type MovieNailer struct{}

type mp4Info struct {
	Duration float64
	Height   int32
	Width    int32
}

func getMp4Duration(fpath string) (mp4Info, error) {
	cmd := exec.Command("ffprobe", "-v", "error", "-show_entries", "format=duration", "-show_entries", "stream=width,height", "-of", "default=noprint_wrappers=1:nokey=1", fpath)
	result, err := cmd.Output()
	if err != nil {
		return mp4Info{}, err
	}
	text := string(result)
	elems := strings.Split(text, "\n")

	if len(elems) < 3 {
		return mp4Info{}, fmt.Errorf("Unexpected output when getting mp4 duration: %s", text)
	}

	width, err1 := strconv.ParseInt(elems[0], 10, 32)
	height, err2 := strconv.ParseInt(elems[1], 10, 32)
	dur, err3 := strconv.ParseFloat(elems[2], 64)
	errs := errors.Join(err1, err2, err3)
	if errs != nil {
		return mp4Info{}, errs
	}
	return mp4Info{
		Duration: dur,
		Width:    int32(width),
		Height:   int32(height),
	}, nil
}

func (*MovieNailer) Generate(fpath string) error {
	log.Printf("Yo, making thumbnails for movie file %s", fpath)
	mp4Info, err := getMp4Duration(fpath)
	if err != nil {
		return err
	}
	position := (mp4Info.Duration * 0.45)
	if position < 0 {
		position = 30
	}

	tempPathFolder, err := cache.ThumbnailsTempFolder.Get()
	if err != nil {
		return err
	}

	replacedPathName := thumbnail.AsThumbnailName(fpath)
	tempOutputPath := path.Join(tempPathFolder, replacedPathName)
	thumbnailFilter := "scale=320:240"
	if float32(mp4Info.Height)*1.3 > float32(mp4Info.Width) {
		thumbnailFilter = "scale=320:480"
	} else if mp4Info.Height > mp4Info.Width {
		thumbnailFilter = "scale=320:320"
	}

	cmd := exec.Command("ffmpeg", "-ss", fmt.Sprint(position), "-i", fpath, "-vf", thumbnailFilter, "-frames:v", "1", "-vsync", "vfr", "-err_detect", "ignore_err", "-y", tempOutputPath)

	err = cmd.Run()
	if err != nil {
		// TODO: Delete any incomplete temporary file
		return err
	}

	// Index the folder based on three first letters of the file name
	fileBasename := path.Base(fpath)
	firstThree := fileBasename[:3]
	sub := cache.ThumbnailsFolder.Sub(firstThree)
	thumbnailFolder, err := sub.Get()
	if err != nil {
		return err
	}

	target := path.Join(thumbnailFolder, replacedPathName+".webp")
	err = os.Rename(tempOutputPath, target)
	if err != nil {
		return err
	}

	log.Printf("Created thumbnail for %s", path.Base(fpath))
	return nil
}

var _ Nailer = &MovieNailer{}
