//go:build windows

package diskusage

import "golang.org/x/sys/windows"

func GetDiskUsage(path string) (DiskStat, error) {
	pathPtr, err := windows.UTF16PtrFromString(path)
	if err != nil {
		return emptyDiskStat, err
	}

	var freeBytesToMe, totalNumberOfBytes, totalFreeBytes uint64

	windows.GetDiskFreeSpaceEx(pathPtr, &freeBytesToMe, &totalNumberOfBytes, &totalFreeBytes)

	return DiskStat{
		TotalBytes: totalNumberOfBytes,
		FreeBytes:  totalFreeBytes,
	}, nil
}
