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

type clearManifestRouter struct{}

func (self *clearManifestRouter) Register(appRouter router.Router) {
	r := appRouter.With(
		appmiddlewares.CsrfProtect,
		appmiddlewares.EnsureClaim(resources.AdminResource, resources.HousekeepingClaim))

	r.Post("/api/admin/clear-manifests", self)
}

func (*clearManifestRouter) ServeHTTP(w http.ResponseWriter, r *http.Request) {
	err := cache.ShareManifestsFolder.Recreate()
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		return
	}

	log.Println("Cleared share link manifests directory")
	router.ReturnToSender(w, r, router.Param("message", "Share link manifests cleared"))
}

func init() {
	approutes.Routes = append(approutes.Routes, &clearManifestRouter{})
}
