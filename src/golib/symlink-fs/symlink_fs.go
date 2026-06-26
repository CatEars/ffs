package symlinkfs

import (
	diskusage "catears/ffs/lib/disk-usage"
	"catears/ffs/lib/disks"
	"fmt"
	"io/fs"
	"os"
	"path/filepath"
	"strings"
)

type SymlinkFS interface {
	disks.Disk
}

type symlinkFs struct {
	id string
	symlinks map[string]string
}

func (s *symlinkFs) Descriptor() string {
	return s.id
}

func (s *symlinkFs) Fs() fs.FS {
	return s
}

func (s *symlinkFs) Id() string {
	return fmt.Sprintf("sym://%s", s.id)
}

func (s *symlinkFs) ModFs() (disks.ModFS, error) {
	panic("SymlinkFS does not implement ModFS")
}

func (s *symlinkFs) Usage() (diskusage.DiskStat, error) {
	for _, entry := range s.symlinks {
		return diskusage.GetDiskUsage(entry)
	}
	panic("Unreachable - SymlinkFS always contains at least one entry")
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

func absPathAllValues(symlinks map[string]string) (map[string]string, error) {
	res := make(map[string]string)
	for key, entry := range symlinks {
		abs, err := filepath.Abs(entry)
		if err != nil {
			return nil, err
		}
		res[key] = abs
	}

	return res, nil
}

func New(id string, symlinks map[string]string) (SymlinkFS, error) {
	if len(symlinks) <= 0 {
		return nil, fmt.Errorf("Cannot create SymlinkFS '%s' with empty symlink mapping", id)
	}

	absedSymlinks, err := absPathAllValues(symlinks)
	if err != nil {
		return nil, err
	}

	return &symlinkFs{
		id: id,
		symlinks: absedSymlinks,
	}, nil
}
