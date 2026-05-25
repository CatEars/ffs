package admin

import (
	"catears/ffs/goapp/cache"
	"catears/ffs/lib/router"
	"log"
	"net/http"
)

type clearManifestRouter struct{}

func (*clearManifestRouter) ServeHTTP(w http.ResponseWriter, r *http.Request) {
	err := cache.ClearManifestsDirAndEnsureExists()
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		return
	}

	log.Println("Cleared share link manifests directory")
	router.ReturnToSender(w, r, router.Param("message", "Share link manifests cleared"))
}
