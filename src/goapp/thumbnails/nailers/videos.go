package nailers

import (
	"errors"
	"fmt"
	"io/fs"
	"os/exec"
	"path"
	"strconv"
	"strings"
)

type VideoNailer struct{}

type videoInfo struct {
	Duration float64
	Height   int32
	Width    int32
}

func DetermineThumbnailFilter(vidInfo videoInfo) string {
	thumbnailFilter := "scale=320:240"
	if float32(vidInfo.Height)*1.3 > float32(vidInfo.Width) {
		thumbnailFilter = "scale=320:480"
	} else if vidInfo.Height > vidInfo.Width {
		thumbnailFilter = "scale=320:320"
	}
	return thumbnailFilter
}

func DetermineThumbnailPosition(vidInfo videoInfo) float64 {
	position := (vidInfo.Duration * 0.45)
	if position < 0 {
		position = 30
	}
	return position
}

var VideoExtNames []string = []string{
	".mp4",
	".m4v",
	".mov",
	".avi",
	".webm",
	".mkv",
	".mpg",
}

func parseVideoDuration(cmd *exec.Cmd) (videoInfo, error) {
	result, err := cmd.Output()
	if err != nil {
		return videoInfo{}, err
	}
	text := string(result)
	elems := strings.Split(text, "\n")

	if len(elems) < 3 {
		return videoInfo{}, fmt.Errorf("Unexpected output when getting mp4 duration: %s", text)
	}

	width, err1 := strconv.ParseInt(elems[0], 10, 32)
	height, err2 := strconv.ParseInt(elems[1], 10, 32)
	dur, err3 := strconv.ParseFloat(elems[2], 64)
	errs := errors.Join(err1, err2, err3)
	if errs != nil {
		return videoInfo{}, errs
	}
	return videoInfo{
		Duration: dur,
		Width:    int32(width),
		Height:   int32(height),
	}, nil
}

func getVideoDurationFs(diskFs fs.FS, fpath string) (videoInfo, error) {
	fhandle, err := diskFs.Open(fpath)
	if err != nil {
		return videoInfo{}, err
	}
	defer fhandle.Close()

	cmd := exec.Command("ffprobe", "-v", "error", "-show_entries", "format=duration", "-show_entries", "stream=width,height", "-of", "default=noprint_wrappers=1:nokey=1", "-")
	cmd.Stdin = fhandle
	return parseVideoDuration(cmd)
}

func getVideoDurationPhys(root, fpath string) (videoInfo, error) {
	joined := path.Join(root, fpath)
	cmd := exec.Command("ffprobe", "-v", "error", "-show_entries", "format=duration", "-show_entries", "stream=width,height", "-of", "default=noprint_wrappers=1:nokey=1", joined)
	return parseVideoDuration(cmd)
}

func runVideoCommand(cmd *exec.Cmd, ctx *NailerContext) error {
	err := cmd.Run()
	// TODO: Delete any incomplete stale temporary file with background process
	if err != nil {
		return err
	}

	return ctx.Success()
}

func produceVideoThumbnailFromFs(ctx *NailerContext) error {
	vidInfo, err := getVideoDurationFs(ctx.Disk.Fs(), ctx.FilePath)
	if err != nil {
		return err
	}

	position := DetermineThumbnailPosition(vidInfo)
	thumbnailFilter := DetermineThumbnailFilter(vidInfo)

	fhandle, err := ctx.Disk.Fs().Open(ctx.FilePath)
	if err != nil {
		return err
	}
	defer fhandle.Close()

	cmd := exec.Command("ffmpeg", "-i", "-", "-ss", fmt.Sprint(position), "-vf", thumbnailFilter, "-frames:v", "1", "-vsync", "vfr", "-err_detect", "ignore_err", "-y", ctx.TempOutputPath)
	cmd.Stdin = fhandle
	return runVideoCommand(cmd, ctx)
}

func produceVideoThumbnailFromPhysicalLocation(physLoc string, ctx *NailerContext) error {
	vidInfo, err := getVideoDurationPhys(physLoc, ctx.FilePath)
	if err != nil {
		return err
	}

	position := DetermineThumbnailPosition(vidInfo)
	thumbnailFilter := DetermineThumbnailFilter(vidInfo)

	joined := path.Join(physLoc, ctx.FilePath)
	cmd := exec.Command("ffmpeg", "-ss", fmt.Sprint(position), "-i", joined, "-vf", thumbnailFilter, "-frames:v", "1", "-vsync", "vfr", "-err_detect", "ignore_err", "-y", ctx.TempOutputPath)

	return runVideoCommand(cmd, ctx)
}

func (*VideoNailer) Generate(ctx *NailerContext) error {
	physLoc, err := ctx.Disk.PhysicalLocation()
	if err == nil {
		return produceVideoThumbnailFromPhysicalLocation(physLoc, ctx)
	} else {
		return produceVideoThumbnailFromFs(ctx)
	}
}

var _ Nailer = &VideoNailer{}
