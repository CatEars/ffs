//go:build unix

package diskusage

import "golang.org/x/sys/unix"

func GetDiskUsage(path string) (DiskStat, error) {
	var stat unix.Statfs_t

	err := unix.Statfs(path, &stat)
	if err != nil {
		return emptyDiskStat, err
	}

	total := stat.Blocks * uint64(stat.Bsize)
	free := stat.Bavail * uint64(stat.Bsize)

	return DiskStat{
		TotalBytes: total,
		FreeBytes:  free,
	}, nil
}
