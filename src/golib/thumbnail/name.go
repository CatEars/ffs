package thumbnail

import (
	"path"
	"strings"
)

func AsThumbnailName(filePath string) string {
	// `path.Base` has a special case for empty string, ignore that.
	if filePath == "" {
		return ""
	}

	// `_` => `__` and then `/` => `_`
	replaced := strings.ReplaceAll(strings.ReplaceAll(filePath, "_", "__"), "/", "_")

	// As defense in depth, ensure we take the basename, in case above permits path traversal.
	replaced = path.Base(replaced)

	return replaced
}
