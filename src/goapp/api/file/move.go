package file

import (
	approutes "catears/ffs/goapp/app-routes"
	"catears/ffs/goapp/appmiddlewares"
	"catears/ffs/lib/router"
	"catears/ffs/lib/security"
	"encoding/json"
	"errors"
	"log"
	"net/http"
	"path"
)

type moveFileRouter struct{}

func (self *moveFileRouter) Register(approuter router.Router) {
	r := approuter.With(
		appmiddlewares.CsrfProtect,
		appmiddlewares.RequireDiskAndFolder(security.StandardAccess.Write()),
	)

	r.Post("/api/file/move", self)
}

type fileToMove struct {
	Path     string `json:"path"`
	FileName string `json:"fileName"`
}

func (move *fileToMove) ToSourceAndDest(destination string) (string, string) {
	return path.Join(move.Path, move.FileName), path.Join(destination, move.FileName)
}

func (*moveFileRouter) ServeHTTP(w http.ResponseWriter, r *http.Request) {
	disk, err := appmiddlewares.GetDiskFromRequest(r)
	if err != nil {
		w.WriteHeader(http.StatusBadRequest)
		return
	}

	mod, err := disk.ModFs()
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		return
	}

	filesToMoveRaw := r.FormValue("files-to-move")
	destination := r.FormValue("destination")

	filesToMove := &[]fileToMove{}
	err = json.Unmarshal([]byte(filesToMoveRaw), filesToMove)
	if err != nil {
		w.WriteHeader(http.StatusBadRequest)
		return
	}

	errs := []error{}
	for _, entry := range *filesToMove {
		source, dest := entry.ToSourceAndDest(destination)
		err = mod.Rename(source, dest)
		if err != nil {
			errs = append(errs, err)
		}
	}

	if len(errs) > 0 {
		log.Printf("[WARN] Failed to move files: %e", errors.Join(errs...))

		w.WriteHeader(http.StatusInternalServerError)
	} else {
		router.ReturnToSender(w, r)
	}
}

func init() {
	approutes.Routes = append(approutes.Routes, &moveFileRouter{})
}
