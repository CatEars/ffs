package nailers

import (
	"catears/ffs/lib/autofolder"
	"os"
	"path"
)

type NailerContext struct {
	FilePath        string
	TempOutputPath  string
	TargetDirectory autofolder.AutoFolder
	OutputName      string
}

func (ctx NailerContext) Success() error {
	outputFolder, err := ctx.TargetDirectory.Get()
	if err != nil {
		return err
	}

	outputPath := path.Join(outputFolder, ctx.OutputName)
	return os.Rename(ctx.TempOutputPath, outputPath)
}

type Nailer interface {
	Generate(ctx NailerContext) error
}
