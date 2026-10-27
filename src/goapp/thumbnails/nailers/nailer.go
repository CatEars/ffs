package nailers

type NailerContext struct {
	FilePath       string
	TempOutputPath string
	TargetPath     string
}

type Nailer interface {
	Generate(ctx NailerContext) error
}
