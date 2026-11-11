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
	ec := &extensionChecker{}
	ec.extensions.AddSlice(extensions)
	return ec
}

func (ec *extensionChecker) MatchesAny(filepath string) bool {
	ext := strings.ToLower(path.Ext(filepath))
	return ec.extensions.Has(ext)
}
