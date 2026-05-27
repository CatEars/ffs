package admin

import (
	approutes "catears/ffs/goapp/app-routes"
	"catears/ffs/goapp/appmiddlewares"
	"catears/ffs/goapp/config"
	"catears/ffs/goapp/resources"
	diskusage "catears/ffs/lib/disk-usage"
	"catears/ffs/lib/display"
	"catears/ffs/lib/router"
	"net/http"
	"path/filepath"
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
	p := config.Config.StoreRoot()
	p, err := filepath.Abs(p)
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		return
	}

	available, err := diskusage.GetDiskUsage(p)
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		return
	}

	usage := diskUsage{
		Path:      p,
		Available: display.FormatBytes(available.FreeBytes),
	}
	router.JsonResponse(w, usage)
}

func init() {
	approutes.Routes = append(approutes.Routes, &diskUsageRouter{})
}
