package nailers

import (
	"catears/ffs/lib/datastructure"
	"path"
	"strings"
)

type extensionChecker struct {
	extensions datastructure.Set
}

func newExtensionChecker(extensions []string) *extensionChecker {
	return &extensionChecker{
		extensions: datastructure.NewSetFromSlice(extensions),
	}
}

func (ec *extensionChecker) MatchesAny(filepath string) bool {
	ext := strings.ToLower(path.Ext(filepath))
	return ec.extensions.Has(ext)
}
