package disks

import (
	"fmt"
)

type DiskStore struct {
	disks map[string]Disk
}

func NewDiskStore() *DiskStore {
	return &DiskStore{
		disks: make(map[string]Disk),
	}

}

func (store *DiskStore) AddDisk(newDisk Disk) error {
	id := newDisk.Id()
	_, exists := store.disks[id]
	if exists {
		return fmt.Errorf("Tried to register a second disk with id %s", id)
	}
	store.disks[id] = newDisk
	return nil
}

func (store *DiskStore) DiskOrDefault(id string) Disk {
	disk, ok := store.disks[id]
	if ok {
		return disk
	}

	return theUndisk
}
