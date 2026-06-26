package disks

import (
	diskusage "catears/ffs/lib/disk-usage"
	"fmt"
	"io"
	"io/fs"
	"os"
	"path"
	"path/filepath"
	"strings"
)

type ModFS interface {
	Mkdir(path string, perm os.FileMode) error
	Rename(source, destination string) error
	Remove(path string) error
	Sub(path string) (ModFS, error)
	Create(path string) (io.WriteCloser, error)
}

type ModFSWithLocation interface {
	AbsPath(path string) (string, error)
}

type Disk interface {
	Id() string
	Fs() fs.FS
	ModFs() (ModFS, error)
	Usage() (diskusage.DiskStat, error)
	Descriptor() string
}

type physicalDisk struct {
	root string
}

func NewPhysicalDisk(root string) Disk {
	return &physicalDisk{
		root: root,
	}
}

func (d *physicalDisk) Id() string {
	return fmt.Sprintf("phys://%s", d.root)
}

func (d *physicalDisk) Fs() fs.FS {
	return os.DirFS(d.root)
}

func (d *physicalDisk) Usage() (diskusage.DiskStat, error) {
	return diskusage.GetDiskUsage(d.root)
}

type modFS struct {
	root     *os.Root
	rootPath string
}

func (mod *modFS) Rename(source, destination string) error {
	return mod.root.Rename(source, destination)
}

func (mod *modFS) Remove(path string) error {
	return mod.root.Remove(path)
}

func (mod *modFS) Sub(fpath string) (ModFS, error) {
	newRoot, err := mod.root.OpenRoot(fpath)
	if err != nil {
		return nil, err
	}

	newPath, err := mod.AbsPath(fpath)
	if err != nil {
		return nil, err
	}

	return &modFS{
		root:     newRoot,
		rootPath: newPath,
	}, nil
}

func (mod *modFS) Mkdir(path string, perm os.FileMode) error {
	return mod.root.Mkdir(path, perm)
}

func (mod *modFS) Create(path string) (io.WriteCloser, error) {
	return mod.root.Create(path)
}

func (mod *modFS) AbsPath(fpath string) (string, error) {
	newPath := path.Join(mod.rootPath, path.Clean(fpath))
	relPath, err := filepath.Rel(mod.rootPath, newPath)
	if err != nil {
		return "", err
	}

	if strings.HasPrefix(relPath, "..") {
		return "", fmt.Errorf("Sub may not access outside its root, attempted %s + %s", mod.rootPath, fpath)
	}

	return newPath, nil
}

func (d *physicalDisk) ModFs() (ModFS, error) {
	r, err := os.OpenRoot(d.root)
	if err != nil {
		return nil, err
	}

	absPath, err := filepath.Abs(d.root)
	if err != nil {
		return nil, err
	}

	return &modFS{
		root:     r,
		rootPath: absPath,
	}, nil
}

func (d *physicalDisk) Descriptor() string {
	result, err := filepath.Abs(d.root)
	if err != nil {
		return d.root
	} else {
		return result
	}
}
