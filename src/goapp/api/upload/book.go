package upload

import (
	approutes "catears/ffs/goapp/app-routes"
	"catears/ffs/goapp/appmiddlewares"
	"catears/ffs/goapp/resources"
	"catears/ffs/goapp/uploading"
	"catears/ffs/lib/router"
	"catears/ffs/lib/security"
	"net/http"
)

type uploadBookRouter struct{}

func (self *uploadBookRouter) Register(approuter router.Router) {
	r := approuter.With(appmiddlewares.CsrfProtect,
		appmiddlewares.EnsureClaim(resources.DiskResources, resources.DiskResources.GetClaim(security.StandardAccess.Write())))

	r.Post("/api/upload/book", self)
}

type returnedData struct {
	AuthToken string `json:"authToken"`
}

func (*uploadBookRouter) ServeHTTP(w http.ResponseWriter, r *http.Request) {
	id, err := uploading.BookingStore.Create()
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		return
	}

	result := returnedData{
		AuthToken: string(id),
	}

	router.JsonResponse(w, result)
}

func init() {
	approutes.Routes = append(approutes.Routes, &uploadBookRouter{})
}
