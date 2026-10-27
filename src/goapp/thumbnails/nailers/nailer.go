package nailers

import "catears/ffs/lib/autofolder"

type NailerContext struct {
	FilePath        string
	TempOutputPath  string
	TargetDirectory autofolder.AutoFolder
	OutputName      string
}

type Nailer interface {
	Generate(ctx NailerContext) error
}
