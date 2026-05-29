package disks

import (
	"net/http"
	"strconv"
)

func DiskIndexFromRequest(r *http.Request) int {
	diskStr := r.URL.Query().Get("disk")
	res, err := strconv.Atoi(diskStr)
	if err != nil {
		return 0
	} else {
		return res
	}
}
