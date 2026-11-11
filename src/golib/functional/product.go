package functional

func Product[T any](lhs, rhs []T, mapping func(a, b T) T) []T {
	res := make([]T, len(lhs)*len(rhs))
	idx := 0
	for _, a := range lhs {
		for _, b := range rhs {
			res[idx] = mapping(a, b)
			idx += 1
		}
	}
	return res
}

type sumOperations struct{}

func (sumOperations) String(a, b string) string {
	return a + b
}

var Sum = sumOperations{}
