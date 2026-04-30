package filetree

import (
	"errors"
	"os"
)

type FileOperation func(os.FileInfo)

type DirectoryOperation func(os.DirEntry)

var InvalidTree = errors.New("Tree is invalid")

func (ft *FileTree) WalkFile(fo *FileOperation) error {
	switch ft {
	case nil:
	case Invalid:
		return errors.New("Tree is invalid, and therefore cannot apply file operation on it")
	}

	finfo, err := os.Stat(ft.Path)
	if err != nil {
		return err
	}

	(*fo)(finfo)
	return nil
}

func (ft *FileTree) WalkDirectory(fd *DirectoryOperation) error {
	switch ft {
	case nil:
	case Invalid:
		return errors.New("Tree is invalid, and therefore cannot apply file operation on it")
	}

	dirs, err := os.ReadDir(ft.Path)
	if err != nil {
		return err
	}

	for _, d := range dirs {
		(*fd)(d)
	}

	return nil
}
