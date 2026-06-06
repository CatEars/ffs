package directory

import (
	approutes "catears/ffs/goapp/app-routes"
	"catears/ffs/goapp/appmiddlewares"
	"catears/ffs/lib/router"
	"catears/ffs/lib/security"
	"net/http"
	"path"
)

type makeDirectoryRouter struct{}

func (self *makeDirectoryRouter) Register(approuter router.Router) {
	r := approuter.With(
		appmiddlewares.CsrfProtect,
		appmiddlewares.RequireDiskAndFolder(security.StandardAccess.Write()))

	r.Post("/api/directory/make", self)
}

func (*makeDirectoryRouter) ServeHTTP(w http.ResponseWriter, r *http.Request) {
	dir := r.FormValue("path")
	dirName := r.FormValue("name")
	if dir == "" || dirName == "" {
		w.WriteHeader(http.StatusBadRequest)
		return
	}

	disk, err := appmiddlewares.GetDiskAndFolderFromRequest(r)
	if err != nil {
		w.WriteHeader(http.StatusBadRequest)
		return
	}

	mod, err := disk.ConvertToModFS()
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		return
	}

	err = mod.Mkdir(path.Join(dir, dirName), 0o777)
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		return
	}

	router.ReturnToSender(w, r)
}

func init() {
	approutes.Routes = append(approutes.Routes, &makeDirectoryRouter{})
}
