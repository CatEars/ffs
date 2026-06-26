package disks

import (
	"fmt"
)

type DiskStore struct {
	disks map[string]Disk
}

func NewDiskStore(disks ...Disk) (*DiskStore, error) {
	if len(disks) <= 0 {
		return nil, fmt.Errorf("You need to have at least one disk for the disk store to work, none given")
	}
	mappedDisks := make(map[string]Disk)
	for _, disk := range disks {
		id := disk.Id()
		_, ok := mappedDisks[id]
		if ok {
			return nil, fmt.Errorf("Tried to register multiple disks with same id %s", id)
		}
		mappedDisks[id] = disk
	}

	return &DiskStore{
		disks: mappedDisks,
	}, nil
}

func (store *DiskStore) DiskOrDefault(id string) Disk {
	disk, ok := store.disks[id]
	if ok {
		return disk
	}

	for _, disk := range store.disks {
		return disk
	}

	panic("Unreachable - store.disks should always contain at least one disk to select from")
}
