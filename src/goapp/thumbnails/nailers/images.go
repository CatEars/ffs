package nailers

import (
	"os/exec"
	"path"
	"strings"
)

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

var imageExtMap map[string]bool = make(map[string]bool)

func init() {
	for _, ext := range ImageExtNames {
		imageExtMap[ext] = true
	}
}

// TODO: Create a re-usable Set type that essentially does this
func isImageFile(fname string) bool {
	ext := path.Ext(fname)
	_, found := imageExtMap[ext]
	return found
}

type ImageNailer struct{}

func (*ImageNailer) Generate(ctx *NailerContext) error {
	physLoc, err := ctx.Disk.PhysicalLocation()
	if err == nil {
		return produceImageThumbnailFromPhysicalLocation(physLoc, ctx)
	} else {
		return produceImageThumbnailFromFs(ctx)
	}
}

func produceImageThumbnailFromFs(ctx *NailerContext) error {
	inputArg := ""
	if strings.HasSuffix(strings.ToLower(ctx.FilePath), ".gif") {
		inputArg = "gif:-[0]"
	}
	fhandle, err := ctx.Disk.Fs().Open(ctx.FilePath)
	if err != nil {
		return err
	}
	defer fhandle.Close()

	cmd := exec.Command("convert", inputArg, "-thumbnail", "128x128", "-quality", "60", ctx.TempOutputPath)
	cmd.Stdin = fhandle

	err = cmd.Run()
	if err != nil {
		return err
	}

	return ctx.Success()
}

func produceImageThumbnailFromPhysicalLocation(physLoc string, ctx *NailerContext) error {
	// TODO: Reduce duplication in this file
	append := ""
	if strings.HasSuffix(strings.ToLower(ctx.FilePath), ".gif") {
		append = "[0]"
	}

	fpath := path.Join(physLoc, ctx.FilePath)

	cmd := exec.Command("convert", fpath+append, "-thumbnail", "128x128", "-quality", "60", ctx.TempOutputPath)

	err := cmd.Run()
	if err != nil {
		return err
	}

	return ctx.Success()
}

var _ Nailer = &ImageNailer{}
