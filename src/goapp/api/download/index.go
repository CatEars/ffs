package download

import (
	approutes "catears/ffs/goapp/app-routes"
	"catears/ffs/goapp/appmiddlewares"
	"catears/ffs/lib/router"
	"catears/ffs/lib/security"
	"catears/ffs/lib/send"
	"log"
	"net/http"
	"path"
	"path/filepath"
)

type downloadRouter struct{}

func (self *downloadRouter) Register(approuter router.Router) {
	r := approuter.With(
		appmiddlewares.CsrfProtect,
		appmiddlewares.RequireDiskAndFolder(security.StandardAccess.Read()))

	r.Post("/api/download", self)
}

func (*downloadRouter) ServeHTTP(w http.ResponseWriter, r *http.Request) {
	err := r.ParseForm()
	if err != nil {
		w.WriteHeader(http.StatusBadRequest)
		return
	}

	filesToDownload, ok := r.Form["file"]
	if !ok || len(filesToDownload) == 0 {
		w.WriteHeader(http.StatusBadRequest)
		return
	}

	root := r.FormValue("root")
	if root == "" {
		w.WriteHeader(http.StatusBadRequest)
		return
	}

	disk, err := appmiddlewares.GetDiskAndFolderFromRequest(r)
	if err != nil {
		w.WriteHeader(http.StatusBadRequest)
		return
	}

	f, err := disk.ConvertToFs()
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		return
	}
	d, err := disk.ConvertToDisk()
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		return
	}

	mappedFiles := make([]string, len(filesToDownload))
	for idx, fname := range filesToDownload {
		mappedFiles[idx] = path.Join(root, fname)
	}

	absPath, err := filepath.Abs(path.Clean(path.Join(d.Descriptor(), root)))
	if err != nil {
		absPath = d.Descriptor()
	}
	base := path.Base(absPath)

	log.Printf("Name: %s", base)
	send.SendFilesSmartly(w, r, f, mappedFiles, &send.SendFilesSmartlyOptions{
		NameHint: base,
	})
}

func init() {
	approutes.Routes = append(approutes.Routes, &downloadRouter{})
}
