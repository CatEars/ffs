package functional

func Filter[T any](filter func(elem T) bool, seq []T) []T {
	res := []T{}
	for _, entry := range seq {
		if filter(entry) {
			res = append(res, entry)
		}
	}
	return res
}
