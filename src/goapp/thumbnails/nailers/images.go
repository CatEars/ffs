package nailers

import (
	"os/exec"
	"path"
	"strings"
)

// LINK-FILE-EXTENSIONS
var ImageExtNames []string = []string{
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

type ImageNailer struct{}

func isGifFormat(filepath string) bool {
	return strings.HasSuffix(strings.ToLower(filepath), ".gif")
}

func runCommand(cmd *exec.Cmd, ctx *NailerContext) error {
	err := cmd.Run()
	if err != nil {
		return err
	}

	return ctx.Success()
}

func produceImageThumbnailFromFs(ctx *NailerContext) error {
	inputArg := ""
	if isGifFormat(ctx.FilePath) {
		inputArg = "gif:-[0]"
	}
	fhandle, err := ctx.Disk.Fs().Open(ctx.FilePath)
	if err != nil {
		return err
	}
	defer fhandle.Close()

	cmd := exec.Command("convert", inputArg, "-thumbnail", "128x128", "-quality", "60", ctx.TempOutputPath)
	cmd.Stdin = fhandle

	return runCommand(cmd, ctx)
}

func produceImageThumbnailFromPhysicalLocation(physLoc string, ctx *NailerContext) error {
	append := ""
	if isGifFormat(ctx.FilePath) {
		append = "[0]"
	}

	fpath := path.Join(physLoc, ctx.FilePath)

	cmd := exec.Command("convert", fpath+append, "-thumbnail", "128x128", "-quality", "60", ctx.TempOutputPath)

	return runCommand(cmd, ctx)
}

func (*ImageNailer) Generate(ctx *NailerContext) error {
	physLoc, err := ctx.Disk.PhysicalLocation()
	if err == nil {
		return produceImageThumbnailFromPhysicalLocation(physLoc, ctx)
	} else {
		return produceImageThumbnailFromFs(ctx)
	}
}

var _ Nailer = &ImageNailer{}
