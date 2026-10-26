package nailers

type AudioNailer struct{}

func (*AudioNailer) Generate(fpath string) error {
	return nil
}

var _ Nailer = &AudioNailer{}
