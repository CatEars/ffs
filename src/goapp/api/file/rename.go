package file

import (
	approutes "catears/ffs/goapp/app-routes"
	"catears/ffs/goapp/appmiddlewares"
	"catears/ffs/lib/router"
	"catears/ffs/lib/security"
	"net/http"
	"path"
)

type renameFileRouter struct{}

func (self *renameFileRouter) Register(approuter router.Router) {
	r := approuter.With(
		appmiddlewares.CsrfProtect,
		appmiddlewares.RequireDiskAndFolder(security.StandardAccess.Write()))

	r.Post("/api/file/rename", self)
}

func (*renameFileRouter) ServeHTTP(w http.ResponseWriter, r *http.Request) {
	fileToRename := r.FormValue("source")
	targetName := r.FormValue("target")

	if fileToRename == "" || targetName == "" {
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

	dir := path.Dir(fileToRename)
	target := path.Join(dir, targetName)

	err = mod.Rename(fileToRename, target)
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		return
	}

	router.ReturnToSender(w, r)
}

func init() {
	approutes.Routes = append(approutes.Routes, &renameFileRouter{})
}
