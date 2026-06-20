package file

import (
	"catears/ffs/goapp/appmiddlewares"
	"catears/ffs/lib/router"
	"catears/ffs/lib/security"
	"encoding/json"
	"net/http"
)

type shareFileRouter struct{}

func (self *shareFileRouter) Register(approuter router.Router) {
	r := approuter.With(
		appmiddlewares.CsrfProtect,
		appmiddlewares.RequireDiskAndFolder(security.StandardAccess.Write()))

	// POST -> Generate link
	r.Post("/api/file/share", self)
	// GET -> Resolve link
	approuter.Get("/api/file/share", self)
}

func getLink(w http.ResponseWriter, r *http.Request) {

}

type requestData struct {
	Folder string `json:"folder"`
}

func createLink(w http.ResponseWriter, r *http.Request) {
	decoder := json.NewDecoder(r.Body)
	reqData := &requestData{}
	err := decoder.Decode(reqData)
	if err != nil {
		w.WriteHeader(http.StatusBadRequest)
		return
	}

	//diskAndFolder, err := appmiddlewares.GetDiskAndFolderFromRequest(r)

}

func (*shareFileRouter) ServeHTTP(w http.ResponseWriter, r *http.Request) {
	if r.Method == "GET" {
		getLink(w, r)
	} else if r.Method == "POST" {
		createLink(w, r)
	} else {
		w.WriteHeader(http.StatusBadRequest)
	}
}

func init() {
	//approutes.Routes = append(approutes.Routes, &shareFileRouter{})
}
