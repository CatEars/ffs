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
	PromoteToParent bool
}

func (ctx *NailerContext) Success() error {
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

func NewNailerContext() *NailerContext {
	return &NailerContext{
		PromoteToParent: false,
	}
}

type Nailer interface {
	Generate(ctx *NailerContext) error
}
