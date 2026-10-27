package nailers

type ImageNailer struct{}

func (*ImageNailer) Generate(ctx NailerContext) error {
	return nil
}

var _ Nailer = &ImageNailer{}
