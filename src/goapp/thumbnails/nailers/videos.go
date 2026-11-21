package nailers

import (
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

func (vidInfo videoInfo) IsPortrait() bool {
	return float32(vidInfo.Height) > float32(vidInfo.Width)*1.3
}

type videoPackage struct {
	VideoInfo  videoInfo
	Location   string
	OutputPath string
}

type videoLocation struct {
	Location string
}

type thumbnailGenerator interface {
	CreateFFMpegThumbnailCommand(vid *videoPackage) *exec.Cmd
}

type speedOptimizedThumbnailGenerator struct{}

func (*speedOptimizedThumbnailGenerator) CreateFFMpegThumbnailCommand(vid *videoPackage) *exec.Cmd {
	position := determineThumbnailPosition(vid.VideoInfo)

	// Assume landscape video
	thumbnailFilter := "scale=320:240"
	if vid.VideoInfo.IsPortrait() {
		thumbnailFilter = "scale=240:320"
	} else if vid.VideoInfo.Height > vid.VideoInfo.Width {
		// Roughly rectangular uses 320x320 scale
		thumbnailFilter = "scale=320:320"
	}

	args := []string{
		"-ss", fmt.Sprint(position),
		"-i", vid.Location,
		"-vf", thumbnailFilter,
		"-frames:v", "1",
		"-vsync", "vfr",
		"-err_detect", "ignore_err",
		"-y",
		vid.OutputPath,
	}

	return exec.Command("ffmpeg", args...)
}

var speedThumbnailer = speedOptimizedThumbnailGenerator{}

type visuallyOptimizedThumbnailGenerator struct{}

func (*visuallyOptimizedThumbnailGenerator) CreateFFMpegThumbnailCommand(vid *videoPackage) *exec.Cmd {
	if vid.VideoInfo.IsPortrait() {
		position := determineThumbnailPosition(vid.VideoInfo)

		// Seek to the beginning of the thumbnail sequence.
		p1 := 0.95 * position

		// Relative offsets from p1.
		p2 := 0.05 * position
		p3 := 0.10 * position

		filterComplex := fmt.Sprintf(
			"[0:v]split=3[v1][v2][v3];"+
				"[v1]select='eq(n,0)',setpts=PTS-STARTPTS,scale=-2:240,pad=iw+2:ih:0:0:black[s1];"+
				"[v2]trim=start=%.3f,setpts=PTS-STARTPTS,select='eq(n,0)',scale=-2:240,pad=iw+2:ih:0:0:black[s2];"+
				"[v3]trim=start=%.3f,setpts=PTS-STARTPTS,select='eq(n,0)',scale=-2:240,pad=iw:ih:0:0:black[s3];"+
				"[s1][s2][s3]hstack=inputs=3[out]",
			p2,
			p3,
		)

		args := []string{
			// Seek before opening the input.
			"-ss", fmt.Sprintf("%.3f", p1),

			// Limit decoder threads.
			"-threads", "1",

			"-i", vid.Location,

			// Ignore streams we don't need.
			"-an",
			"-sn",
			"-dn",

			// Limit filter graph threads.
			"-filter_complex_threads", "1",

			"-filter_complex", filterComplex,
			"-map", "[out]",

			// Only generate one frame.
			"-frames:v", "1",

			"-err_detect", "ignore_err",
			"-y",

			vid.OutputPath,
		}

		return exec.Command("ffmpeg", args...)
	} else {
		return speedThumbnailer.CreateFFMpegThumbnailCommand(vid)
	}
}

var visualThumbnailer = visuallyOptimizedThumbnailGenerator{}

func generateFFProbeCommand(location string) *exec.Cmd {
	return exec.Command("ffprobe", "-v", "error", "-show_entries", "format=duration", "-show_entries", "stream=width,height", "-of", "default=noprint_wrappers=1:nokey=1", location)
}

var videoThumbnailer thumbnailGenerator = &visualThumbnailer

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

func determineThumbnailPosition(vidInfo videoInfo) float64 {
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
	err := cmd.Run()
	// TODO: Delete any incomplete stale temporary file with background process
	if err != nil {
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

	loc := "-"
	probeCmd := generateFFProbeCommand(loc)
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

	vid := &videoPackage{
		VideoInfo:  vidInfo,
		Location:   loc,
		OutputPath: ctx.TempOutputPath,
	}

	cmd := videoThumbnailer.CreateFFMpegThumbnailCommand(vid)
	cmd.Stdin = fhandle2
	return runVideoCommand(cmd, ctx)
}

func produceVideoThumbnailFromPhysicalLocation(physLoc string, ctx *NailerContext) error {
	loc := path.Join(physLoc, ctx.FilePath)
	probeCmd := generateFFProbeCommand(loc)
	vidInfo, err := parseVideoDuration(probeCmd)
	if err != nil {
		return err
	}

	vid := &videoPackage{
		VideoInfo:  vidInfo,
		Location:   loc,
		OutputPath: ctx.TempOutputPath,
	}

	cmd := videoThumbnailer.CreateFFMpegThumbnailCommand(vid)
	//	cmd.Stderr = os.Stderr
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

// Ensure `VideoNailer` always implements `Nailer` interface
var _ Nailer = &VideoNailer{}
