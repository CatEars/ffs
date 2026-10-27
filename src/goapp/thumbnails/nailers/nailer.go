package nailers

import (
	"catears/ffs/lib/autofolder"
	"log"
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
	err = os.Rename(ctx.TempOutputPath, outputPath)
	if err != nil {
		return err
	}

	log.Printf("Created thumbnail for %s", path.Base(ctx.FilePath))
	return nil
}

type Nailer interface {
	Generate(ctx NailerContext) error
}
