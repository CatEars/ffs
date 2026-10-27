package nailers

type ImageNailer struct{}

func (*ImageNailer) Generate(ctx NailerContext) error {
	/*append := ""
	if strings.HasSuffix(strings.ToLower(ctx.FilePath), ".gif") {
		append = "[0]"
	}*/

	return nil
}

var _ Nailer = &ImageNailer{}
