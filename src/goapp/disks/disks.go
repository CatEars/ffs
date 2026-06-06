package disks

import (
	diskusage "catears/ffs/lib/disk-usage"
	"fmt"
	"io/fs"
	"os"
	"path/filepath"
)

type DiskAndFolder struct {
	DiskIdx int
	Path    string
}

func (diskAndFolder *DiskAndFolder) ConvertToFs() (fs.FS, error) {
	if diskAndFolder.DiskIdx > len(disks) {
		return nil, fmt.Errorf("No disk matching index %d", diskAndFolder.DiskIdx)
	}

	disk := disks[diskAndFolder.DiskIdx]
	filesystem := disk.Fs()
	if diskAndFolder.Path == "." {
		return filesystem, nil
	}

	return fs.Sub(filesystem, diskAndFolder.Path)
}

func (diskAndFolder *DiskAndFolder) ConvertToModFS() (ModFS, error) {
	if diskAndFolder.DiskIdx > len(disks) {
		return nil, fmt.Errorf("No disk matching index %d", diskAndFolder.DiskIdx)
	}

	disk := disks[diskAndFolder.DiskIdx]
	mod, err := disk.ModFs()
	if err != nil {
		return nil, err
	}

	return mod.Sub(diskAndFolder.Path)
}

type ModFS interface {
	Mkdir(path string, perm os.FileMode) error
	Rename(source, destination string) error
	Remove(path string) error
	Sub(path string) (ModFS, error)
}

type Disk interface {
	Fs() fs.FS
	ModFs() (ModFS, error)
	Usage() (diskusage.DiskStat, error)
	Descriptor() string
}

var disks []Disk = []Disk{}

func GetDisk(idx int) Disk {
	if idx < 0 || idx >= len(disks) {
		return disks[0]
	} else {
		return disks[idx]
	}
}

func NumberOfMountedDisks() int {
	return len(disks)
}

type physicalDisk struct {
	root string
}

func NewPhysicalDisk(root string) Disk {
	return &physicalDisk{
		root: root,
	}
}

func (d *physicalDisk) Fs() fs.FS {
	return os.DirFS(d.root)
}

func (d *physicalDisk) Usage() (diskusage.DiskStat, error) {
	return diskusage.GetDiskUsage(d.root)
}

type modFS struct {
	root *os.Root
}

func (mod *modFS) Rename(source, destination string) error {
	return mod.root.Rename(source, destination)
}

func (mod *modFS) Remove(path string) error {
	return mod.root.Remove(path)
}

func (mod *modFS) Sub(path string) (ModFS, error) {
	newRoot, err := mod.root.OpenRoot(path)
	if err != nil {
		return nil, err
	}

	return &modFS{
		root: newRoot,
	}, nil
}

func (mod *modFS) Mkdir(path string, perm os.FileMode) error {
	return mod.root.Mkdir(path, perm)
}

func (d *physicalDisk) ModFs() (ModFS, error) {
	r, err := os.OpenRoot(d.root)
	if err != nil {
		return nil, err
	}

	return &modFS{
		root: r,
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

func InitializeDisks(d ...Disk) {
	disks = d
}
