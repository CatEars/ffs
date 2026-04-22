package functional

func IsArrayPrefix(prefix, tested []string) bool {
	if len(prefix) > len(tested) {
		return false
	}

	for idx, p := range prefix {
		if tested[idx] != p {
			return false
		}
	}

	return true
}
