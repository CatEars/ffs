package file

import (
	approutes "catears/ffs/goapp/app-routes"
	"catears/ffs/goapp/appmiddlewares"
	"catears/ffs/goapp/disks"
	"catears/ffs/lib/router"
	"catears/ffs/lib/security"
	"net/http"
	"strings"
)

type fileRouter struct{}

func (self *fileRouter) Register(approuter router.Router) {
	r := approuter.With(appmiddlewares.RequireDiskAndFolder(security.StandardAccess.Write()))

	r.Get("/api/file", self)
}

func (*fileRouter) ServeHTTP(w http.ResponseWriter, r *http.Request) {
	p := r.URL.Query().Get("path")
	if p == "" {
		w.WriteHeader(http.StatusNotFound)
		return
	}
	p = strings.TrimPrefix(p, "./")

	diskAndIdx := r.Context().Value(appmiddlewares.GetDiskAndFolderKey())
	if diskAndIdx == nil {
		w.WriteHeader(http.StatusBadRequest)
		return
	}

	d := diskAndIdx.(*disks.DiskAndFolder)
	f, err := d.ConvertToFs()
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		return
	}

	http.ServeFileFS(w, r, f, p)
}

func init() {
	approutes.Routes = append(approutes.Routes, &fileRouter{})
}
