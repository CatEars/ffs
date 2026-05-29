package admin

import (
	approutes "catears/ffs/goapp/app-routes"
	"catears/ffs/goapp/appmiddlewares"
	"catears/ffs/goapp/disks"
	"catears/ffs/goapp/resources"
	"catears/ffs/lib/display"
	"catears/ffs/lib/router"
	"net/http"
)

type diskUsage struct {
	Path      string `json:"path"`
	Available string `json:"available"`
}

type diskUsageRouter struct{}

func (self *diskUsageRouter) Register(approuter router.Router) {
	r := approuter.With(appmiddlewares.EnsureClaim(resources.AdminResource, resources.HousekeepingClaim))

	r.Get("/api/admin/disk-usage", self)
}

func (*diskUsageRouter) ServeHTTP(w http.ResponseWriter, r *http.Request) {
	diskIdx := disks.DiskIndexFromRequest(r)
	disk := disks.GetDisk(diskIdx)
	available, err := disk.Usage()
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		return
	}

	usage := diskUsage{
		Path:      disk.Descriptor(),
		Available: display.FormatBytes(available.FreeBytes),
	}
	router.JsonResponse(w, usage)
}

func init() {
	approutes.Routes = append(approutes.Routes, &diskUsageRouter{})
}
