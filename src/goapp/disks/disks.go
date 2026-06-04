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

type Disk interface {
	Fs() fs.FS
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
