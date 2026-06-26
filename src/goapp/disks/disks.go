package disks

import (
	"catears/ffs/lib/disks"
)

var DiskStore *disks.DiskStore

func InitializeDisks(d ...disks.Disk) {
	diskStore, err := disks.NewDiskStore(d...)
	if err != nil {
		// TODO: Some disks making access of any disk is out of the question!
		panic("Unable to initialize disks!")
	}
	DiskStore = diskStore
}
