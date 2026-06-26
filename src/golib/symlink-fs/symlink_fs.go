package symlinkfs

import (
	"fmt"
	"io/fs"
	"os"
	"path/filepath"
	"strings"
)

type symlinkFs struct {
	symlinks map[string]string
}

func (s *symlinkFs) longestMatchingPrefix(name string) (matchedPrefix string, mappedTo string) {
	maxLen := 0
	maxPref := ""
	maxMap := ""
	for key, val := range s.symlinks {
		if len(key) <= maxLen {
			continue
		}

		if strings.HasPrefix(name, key) {
			maxLen = len(name)
			maxPref = key
			maxMap = val
		}
	}
	return maxPref, maxMap
}

func (s *symlinkFs) translateName(name string) (string, error) {
	absolute, err := filepath.Abs(name)
	if err != nil {
		return "", err
	}

	longestPrefix, mapping := s.longestMatchingPrefix(absolute)
	if longestPrefix == "" {
		return "", fmt.Errorf("%s failed to be mapped to any symlinkFs path", name)
	}

	return mapping + absolute[len(longestPrefix):], nil
}

func (s *symlinkFs) Open(name string) (fs.File, error) {
	realPath, err := s.translateName(name)
	if err != nil {
		return nil, err
	}

	return os.Open(realPath)
}

func (s *symlinkFs) Stat(name string) (fs.FileInfo, error) {
	realPath, err := s.translateName(name)
	if err != nil {
		return nil, err
	}

	return os.Stat(realPath)
}

func (s *symlinkFs) ReadDir(name string) ([]fs.DirEntry, error) {
	realPath, err := s.translateName(name)
	if err != nil {
		return nil, err
	}

	return os.ReadDir(realPath)
}

func New(symlinks map[string]string) fs.FS {
	return &symlinkFs{
		symlinks: symlinks,
	}
}
