package symlinkfs

import (
	"io/fs"
	"os"
	"strings"
	"filepath"
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

/*func (s *symlinkFs) Open(name string) (fs.File, error) {
	absolute, err := filepath.Abs(name)
	if err != nil {
		return nil, err
	}
}*/

func (s *symlinkFs) Stat(name string) (fs.FileInfo, error) {

}

func (s *symlinkFs) ReadDir(name string) ([]fs.DirEntry, error) {
	
}

func New() fs.FS {
	return &symlinkFs{}
}
