package filetype

import "strings"

type FileType int

const (
	Video FileType = iota
	Image
	Sound
	Directory
	Undefined
)

var VideoExtensions []string = []string{"mp4", "mv4", "m4v"}
var ImageExtensions []string = []string{"png", "jpg", "jpeg", "gif", "tiff", "webp", "avif", "bmp", "ico"}
var SoundExtensions []string = []string{"mp3"}

func pathEndsInOneOf(path string, exts []string) bool {
	for _, v := range exts {
		if strings.HasSuffix(path, v) {
			return true
		}
	}

	return false
}

func IsVideoFile(filePath string) bool {
	return pathEndsInOneOf(strings.ToLower(filePath), VideoExtensions)
}

func IsImageFile(filePath string) bool {
	return pathEndsInOneOf(strings.ToLower(filePath), ImageExtensions)
}

func IsSoundFile(filePath string) bool {
	return pathEndsInOneOf(strings.ToLower(filePath), SoundExtensions)
}
