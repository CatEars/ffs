package nailers

type ImageNailer struct{}

func (*ImageNailer) Generate(fpath string) error {
	return nil
}

var _ Nailer = &ImageNailer{}
