package diskusage

type DiskStat struct {
	TotalBytes uint64
	FreeBytes  uint64
}

var emptyDiskStat = DiskStat{
	TotalBytes: 0,
	FreeBytes:  0,
}
