package nailers

type Nailer interface {
	Generate(fpath string) error
}
