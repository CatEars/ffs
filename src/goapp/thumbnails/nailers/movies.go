package nailers

import (
	"errors"
	"fmt"
	"os"
	"os/exec"
	"path"
	"slices"
	"strconv"
	"strings"
)

type MovieNailer struct{}

type mp4Info struct {
	Duration float64
	Height   int32
	Width    int32
}

var MovieExtNames []string = []string{
	".mp4",
	".m4v",
	".mov",
	".avi",
	".webm",
	".mkv",
	".mpg",
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

func (*MovieNailer) Generate(ctx *NailerContext) error {
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

	err = ctx.Success()
	if err != nil {
		return err
	}

	// If there is only a single video in the folder, promote that to parent directory as thumbnail.
	entriesInFolder, err := os.ReadDir(path.Dir(ctx.FilePath))
	cnt := 0
	for _, entry := range entriesInFolder {
		ext := strings.ToLower(path.Ext(entry.Name()))
		if slices.Index(MovieExtNames, ext) != -1 {
			cnt += 1
			if cnt > 1 {
				break
			}
		}
	}

	if cnt == 1 {
		ctx.PromoteToParent = true
	}

	return nil
}

var _ Nailer = &MovieNailer{}
