package nailers

import (
	"errors"
	"fmt"
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

func (*MovieNailer) Generate(ctx NailerContext) error {
	mp4Info, err := getMp4Duration(ctx.FilePath)
	if err != nil {
		return err
	}
	position := (mp4Info.Duration * 0.45)
	if position < 0 {
		position = 30
	}

	thumbnailFilter := "scale=320:240"
	if float32(mp4Info.Height)*1.3 > float32(mp4Info.Width) {
		thumbnailFilter = "scale=320:480"
	} else if mp4Info.Height > mp4Info.Width {
		thumbnailFilter = "scale=320:320"
	}

	cmd := exec.Command("ffmpeg", "-ss", fmt.Sprint(position), "-i", ctx.FilePath, "-vf", thumbnailFilter, "-frames:v", "1", "-vsync", "vfr", "-err_detect", "ignore_err", "-y", ctx.TempOutputPath)

	err = cmd.Run()
	// TODO: Delete any incomplete stale temporary file with background process

	if err != nil {
		return err
	}

	outputFolder, err := ctx.TargetDirectory.Get()
	if err != nil {
		return err
	}

	outputPath := path.Join(outputFolder, ctx.OutputName)
	err = os.Rename(ctx.TempOutputPath, outputPath)
	if err != nil {
		return err
	}

	return nil
}

var _ Nailer = &MovieNailer{}
