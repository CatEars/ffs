package nailers

type AudioNailer struct{}

func (*AudioNailer) Generate(ctx NailerContext) error {
	return nil
}

var _ Nailer = &AudioNailer{}
