package nailers

import (
	"os/exec"
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

	return ctx.Success()
}

var _ Nailer = &ImageNailer{}
