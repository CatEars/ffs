package nailers

import (
	"catears/ffs/lib/ffslog"
	"errors"
	"fmt"
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

type videoLocation struct {
	Location string
}

func (loc *videoLocation) GenerateFFProbeCommand() *exec.Cmd {
	return exec.Command("ffprobe", "-v", "error", "-show_entries", "format=duration", "-show_entries", "stream=width,height", "-of", "default=noprint_wrappers=1:nokey=1", loc.Location)
}

func (loc *videoLocation) GenerateFFMpegThumbnailCommand(vidInfo videoInfo, outputPath string) *exec.Cmd {
	// TODO: Optimize the speed of both ffmpeg commands

	position := DetermineThumbnailPosition(vidInfo)
	if false || float32(vidInfo.Height)*1.3 > float32(vidInfo.Width) {
		ffslog.Print("PORTRAIT")
		// Portrait -> generate three "portraits" and concat them together: A|B|C
		// Compute the three timestamps based on the float64 position
		p1 := 0.95 * position
		p2 := position
		p3 := 1.05 * position

		// Dynamically build the filter_complex string using fmt.Sprintf
		// Filter complex with 2px vertical borders only between images
		filterComplex := fmt.Sprintf(
			"[0:v]split=3[v1][v2][v3]; "+
				"[v1]trim=start=%.3f,setpts=PTS-STARTPTS,select='eq(n,0)',scale=-2:240,pad=iw+2:ih:0:0:black[s1]; "+
				"[v2]trim=start=%.3f,setpts=PTS-STARTPTS,select='eq(n,0)',scale=-2:240,pad=iw+2:ih:0:0:black[s2]; "+
				"[v3]trim=start=%.3f,setpts=PTS-STARTPTS,select='eq(n,0)',scale=-2:240,pad=iw:ih:0:0:black[s3]; "+
				"[s1][s2][s3]hstack=inputs=3[out]",
			p1, p2, p3,
		)

		// Assemble the argument list including your flags
		args := []string{
			"-i", loc.Location,
			"-frames:v", "1",
			//			"-vsync", "vfr",
			"-err_detect", "ignore_err",
			"-y",
			"-filter_complex", filterComplex,
			"-map", "[out]",
			outputPath,
		}

		return exec.Command("ffmpeg", args...)
	}

	ffslog.Print("NON-PORTRAIT")
	// Assume landscape video
	thumbnailFilter := "scale=320:240"
	if vidInfo.Height > vidInfo.Width {
		// Roughly rectangular uses 320x320 scale
		thumbnailFilter = "scale=320:320"
	}

	args := []string{
		"-i", loc.Location,
		"-ss", fmt.Sprint(position),
		"-vf", thumbnailFilter,
		"-frames:v", "1",
		//		"-vsync", "vfr",
		"-err_detect", "ignore_err",
		"-y",
		outputPath,
	}

	return exec.Command("ffmpeg", args...)
}

func newFsVideoLocation() *videoLocation {
	return &videoLocation{
		Location: "-",
	}
}

func newPhysVideoLocation(root, filePath string) *videoLocation {
	return &videoLocation{
		Location: path.Join(root, filePath),
	}
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

// TODO: Check if priority thumbnailing is actually working

func runVideoCommand(cmd *exec.Cmd, ctx *NailerContext) error {
	//cmd.Stderr = os.Stderr
	err := cmd.Run()
	// TODO: Delete any incomplete stale temporary file with background process
	if err != nil {
		ffslog.Print("WARN its just that bad", err)
		return err
	}

	return ctx.Success()
}

func produceVideoThumbnailFromFs(ctx *NailerContext) error {
	fhandle, err := ctx.Disk.Fs().Open(ctx.FilePath)
	if err != nil {
		return err
	}
	defer fhandle.Close()

	loc := newFsVideoLocation()
	probeCmd := loc.GenerateFFProbeCommand()
	probeCmd.Stdin = fhandle

	vidInfo, err := parseVideoDuration(probeCmd)
	if err != nil {
		return err
	}

	fhandle2, err := ctx.Disk.Fs().Open(ctx.FilePath)
	if err != nil {
		return err
	}
	defer fhandle2.Close()

	cmd := loc.GenerateFFMpegThumbnailCommand(vidInfo, ctx.TempOutputPath)
	cmd.Stdin = fhandle2
	return runVideoCommand(cmd, ctx)
}

func produceVideoThumbnailFromPhysicalLocation(physLoc string, ctx *NailerContext) error {
	loc := newPhysVideoLocation(physLoc, ctx.FilePath)
	probeCmd := loc.GenerateFFProbeCommand()
	vidInfo, err := parseVideoDuration(probeCmd)
	if err != nil {
		return err
	}

	cmd := loc.GenerateFFMpegThumbnailCommand(vidInfo, ctx.TempOutputPath)
	ffslog.Print("were getting physical", cmd.Args)
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
