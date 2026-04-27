package filetree

import (
	"path/filepath"
	"strings"
)

type FileTree struct {
	Path string
}

var Invalid = &FileTree{
	Path: "../invalid-path",
}

const separator string = string(filepath.Separator)

func (ft *FileTree) SuperPaths(path string) bool {
	switch ft {
	case nil:
		return false
	case Invalid:
		return false
	}

	rel, err := filepath.Rel(ft.Path, path)
	if err != nil {
		return false
	}

	startsWithPathTraversal := strings.HasPrefix(rel, ".."+separator) || rel == ".."
	return !startsWithPathTraversal
}

func (ft *FileTree) Traverse(path string, extraPaths ...string) *FileTree {
	switch ft {
	case nil:
		return nil
	case Invalid:
		return Invalid
	}

	allTraversals := append([]string{ft.Path, path}, extraPaths...)
	traversedPath := filepath.Join(allTraversals...)
	cleanedPath := filepath.Clean(traversedPath)

	if !ft.SuperPaths(cleanedPath) {
		return Invalid
	}

	return New(cleanedPath)
}

func New(root string) *FileTree {
	return &FileTree{
		Path: root,
	}
}
