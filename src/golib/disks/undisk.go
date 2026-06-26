package disks

import (
	diskusage "catears/ffs/lib/disk-usage"
	"errors"
	"io/fs"
	"testing/fstest"
)

type undisk interface {
	Disk
}

type undiskImpl struct{}

func (u *undiskImpl) Descriptor() string {
	return "This is the un-disk, the disk loaded when your disk fails to load"
}

func (u *undiskImpl) Fs() fs.FS {
	// Make an empty test FS so there are no files
	return make(fstest.MapFS)
}

func (u *undiskImpl) Id() string {
	return "undisk://the-undisk"
}

func (u *undiskImpl) ModFs() (ModFS, error) {
	return nil, errors.New("the undisk does not implement ModFs")
}

func (u *undiskImpl) Usage() (diskusage.DiskStat, error) {
	return diskusage.DiskStat{
		TotalBytes: 0,
		FreeBytes:  0,
	}, nil
}

func newUndisk() undisk {
	return &undiskImpl{}
}

var theUndisk = newUndisk()