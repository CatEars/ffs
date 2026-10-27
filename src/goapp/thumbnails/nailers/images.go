package nailers

import (
	"os"
	"os/exec"
	"path"
	"strings"
)

type ImageNailer struct{}

func (*ImageNailer) Generate(ctx NailerContext) error {
	append := ""
	if strings.HasSuffix(strings.ToLower(ctx.FilePath), ".gif") {
		append = "[0]"
	}

	cmd := exec.Command("convert", ctx.FilePath+append, "-thumbnail", "128x128", "-quality", "60", ctx.TempOutputPath)
	err := cmd.Run()
	if err != nil {
		return err
	}

	// TODO: The code below is the same between nailers, put into `NailerContext.Success()`
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

var _ Nailer = &ImageNailer{}
