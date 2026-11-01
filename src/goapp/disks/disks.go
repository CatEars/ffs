package disks

import (
	"catears/ffs/lib/disks"
	"catears/ffs/lib/ffslog"
	"errors"
)

var DiskStore *disks.DiskStore

func InitializeDisks(d ...disks.Disk) {
	diskStore := disks.NewDiskStore()
	errs := []error{}
	for _, disk := range d {
		err := diskStore.AddDisk(disk)
		if err != nil {
			errs = append(errs, err)
		}
	}
	DiskStore = diskStore
	if len(errs) > 0 {
		e := errors.Join(errs...)
		ffslog.Warnf("Got errors when initializing disks: %s", e.Error())
	}
}
