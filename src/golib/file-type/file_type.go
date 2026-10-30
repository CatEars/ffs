package filetype

import "strings"

type FileType int

const (
	Video FileType = iota
	Image
	Audio
	Directory
	Undefined
)

var VideoExtensions []string = []string{
	".mp4",
	".m4v",
	".mov",
	".avi",
	".webm",
	".mkv",
	".mpg",
}

var ImageExtensions []string = []string{
	".png",
	".jpg",
	".jpeg",
	".tiff",
	".webp",
	".gif",
	".avif",
	".bmp",
	".ico",
	".psd",
}

var AudioExtensions []string = []string{
	".mp3",
	".wav",
	".ogg",
	".flac",
	".aac",
	".m4a",
	".opus",
	".wma",
	".ape",
}

func pathEndsInOneOf(path string, exts []string) bool {
	for _, v := range exts {
		if strings.HasSuffix(path, v) {
			return true
		}
	}

	return false
}

func IsAudioFile(filePath string) bool {
	return pathEndsInOneOf(strings.ToLower(filePath), AudioExtensions)
}

func IsVideoFile(filePath string) bool {
	return pathEndsInOneOf(strings.ToLower(filePath), VideoExtensions)
}

func IsImageFile(filePath string) bool {
	return pathEndsInOneOf(strings.ToLower(filePath), ImageExtensions)
}

func isAudioVideoOrImage(filePath string) (bool, bool, bool) {
	lower := strings.ToLower(filePath)
	return pathEndsInOneOf(lower, AudioExtensions), pathEndsInOneOf(lower, VideoExtensions), pathEndsInOneOf(lower, ImageExtensions)
}
