package thumbnail

import (
	"catears/ffs/lib/autofolder"
	"path"
	"strings"
)

func minInt(a int, b int) int {
	if b < a {
		return b
	}
	return a
}

func ResolveThumbnailFolder(base autofolder.AutoFolder, diskId string, fPath string) autofolder.AutoFolder {
	// Index the thumbnail folders based on first six symbols of the file name with two levels of folders
	// For file names shorter than six symbols, just repeat the last symbol to get six symbols in total
	// We do not want all thumbnails in the same folder, using two levels of indirection should be sufficient
	fileBasename := path.Base(fPath)
	fileBasename, _ = strings.CutPrefix(fileBasename, ".")
	fileBasename, _ = strings.CutSuffix(fileBasename, path.Ext(fileBasename))
	diskId = strings.ReplaceAll(strings.ReplaceAll(diskId, "_", "__"), "/", "_")

	res := base.Sub(diskId)

	cnt := 0
	for range 2 {
		subPath := ""
		for range 3 {
			subPath = subPath + fileBasename[cnt:cnt+1]
			cnt = minInt(len(fileBasename)-1, cnt+1)
		}
		res = res.Sub(subPath)
	}
	return res
}

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
