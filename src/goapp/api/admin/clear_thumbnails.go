package admin

import (
	approutes "catears/ffs/goapp/app-routes"
	"catears/ffs/goapp/appmiddlewares"
	"catears/ffs/goapp/cache"
	"catears/ffs/goapp/resources"
	"catears/ffs/lib/router"
	"log"
	"net/http"
)

type clearThumbnailsRouter struct{}

func (self *clearThumbnailsRouter) Register(approuter router.Router) {
	r := approuter.With(appmiddlewares.CsrfProtect, appmiddlewares.EnsureClaim(resources.AdminResource, resources.HousekeepingClaim))

	r.Post("/api/admin/clear-thumbnails", self)
}

func (*clearThumbnailsRouter) ServeHTTP(w http.ResponseWriter, r *http.Request) {
	err := cache.ThumbnailsFolder.Recreate()
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		return
	}

	log.Printf("Cleared thumbnails directory")
	router.ReturnToSender(w, r, router.Param("message", "Thumbnails cleared"))
}

func init() {
	approutes.Routes = append(approutes.Routes, &clearThumbnailsRouter{})
}
