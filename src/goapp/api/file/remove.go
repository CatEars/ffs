package file

import (
	approutes "catears/ffs/goapp/app-routes"
	"catears/ffs/goapp/appmiddlewares"
	"catears/ffs/goapp/disks"
	"catears/ffs/lib/router"
	"catears/ffs/lib/security"
	"encoding/json"
	"errors"
	"log"
	"net/http"
	"path"
)

type removeFileRouter struct{}

func (self *removeFileRouter) Register(approuter router.Router) {
	r := approuter.With(
		appmiddlewares.CsrfProtect,
		appmiddlewares.RequireDiskAndFolder(security.StandardAccess.Write()))

	r.Post("/api/file/remove", self)
}

type fileToRemove struct {
	Path     string `json:"path"`
	FileName string `json:"fileName"`
}

func (*removeFileRouter) ServeHTTP(w http.ResponseWriter, r *http.Request) {
	diskFromRequest := r.Context().Value(appmiddlewares.GetDiskAndFolderKey())
	if diskFromRequest == nil {
		w.WriteHeader(http.StatusBadRequest)
		return
	}

	filesToRemoveRaw := r.FormValue("files-to-remove")
	if filesToRemoveRaw == "" {
		w.WriteHeader(http.StatusBadRequest)
		return
	}

	filesToRemove := &[]fileToRemove{}
	err := json.Unmarshal([]byte(filesToRemoveRaw), filesToRemove)
	if err != nil {
		w.WriteHeader(http.StatusBadRequest)
		return
	}

	diskAndFolder := diskFromRequest.(*disks.DiskAndFolder)
	remover, err := diskAndFolder.ConvertToRemover()
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		return
	}

	errs := []error{}
	for _, fileRemoval := range *filesToRemove {
		subPath := path.Join(fileRemoval.Path, fileRemoval.FileName)
		err = remover.Remove(subPath)
		if err != nil {
			errs = append(errs, err)
		}
	}

	if len(errs) > 0 {
		log.Printf("[WARN] Failed to delete files: %e", errors.Join(errs...))
		w.WriteHeader(http.StatusInternalServerError)
	} else {
		router.ReturnToSender(w, r)
	}
}

func init() {
	approutes.Routes = append(approutes.Routes, &removeFileRouter{})
}
