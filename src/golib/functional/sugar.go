package functional

import "cmp"

func If[T any](expr bool, lhs, rhs T) T {
	if expr {
		return lhs
	} else {
		return rhs
	}
}

func Max[T cmp.Ordered](a, b T) T {
	if a > b {
		return a
	} else {
		return b
	}
}
