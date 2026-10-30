package filetype

import (
	"io/fs"
	"os"
)

type FileDescription struct {
	filePath      string
	hasCheckedDir bool
	isDir         bool
	IsAudioFile   bool
	IsVideoFile   bool
	IsImageFile   bool
}

func NewFileDescription(filePath string) *FileDescription {
	audio, video, image := isAudioVideoOrImage(filePath)

	return &FileDescription{
		IsAudioFile:   audio,
		IsVideoFile:   video,
		IsImageFile:   image,
		filePath:      filePath,
		hasCheckedDir: false,
		isDir:         false,
	}
}

func NewFileDescriptionFromFileInfo(dirEntry fs.FileInfo) *FileDescription {
	n := dirEntry.Name()
	audio, video, image := isAudioVideoOrImage(n)
	return &FileDescription{
		IsAudioFile:   audio,
		IsVideoFile:   video,
		IsImageFile:   image,
		filePath:      n,
		hasCheckedDir: true,
		isDir:         dirEntry.IsDir(),
	}
}

func (fs *FileDescription) IsDirectory() (bool, error) {
	if fs.hasCheckedDir {
		return fs.isDir, nil
	}

	s, err := os.Stat(fs.filePath)
	if err != nil {
		return false, err
	}

	fs.isDir = s.IsDir()
	fs.hasCheckedDir = true
	return fs.isDir, nil
}

func (fs *FileDescription) FileType() (FileType, error) {
	if fs.IsAudioFile {
		return Audio, nil
	} else if fs.IsImageFile {
		return Image, nil
	} else if fs.IsVideoFile {
		return Video, nil
	}

	d, err := fs.IsDirectory()
	if err != nil {
		return Undefined, err
	} else if d {
		return Directory, nil
	}

	return Undefined, nil
}
