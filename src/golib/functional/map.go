package functional

func Map[T, O any](mapper func(input T) O, seq []T) []O {
	res := make([]O, len(seq))
	for idx, entry := range seq {
		res[idx] = mapper(entry)
	}
	return res
}
