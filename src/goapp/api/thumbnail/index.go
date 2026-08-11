package thumbnail

import (
	approutes "catears/ffs/goapp/app-routes"
	"catears/ffs/goapp/appmiddlewares"
	"catears/ffs/goapp/cache"
	"catears/ffs/lib/router"
	"catears/ffs/lib/security"
	"net/http"
	"os"
)

type thumbnailRouter struct{}

func (self *thumbnailRouter) Register(approuter router.Router) {
	r := approuter.With(appmiddlewares.RequireDisk(security.StandardAccess.Write()))

	r.Get("/api/thumbnail", self)
}

func (*thumbnailRouter) ServeHTTP(w http.ResponseWriter, r *http.Request) {
	filePath := r.URL.Query().Get("path")
	if filePath == "" {
		w.WriteHeader(http.StatusBadRequest)
		return
	}

	thumbnailFolder, err := cache.ThumbnailsFolder.Get()
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		return
	}

	// TODO: The file system is based on "disk" abstraction, but thumbnails are not
	// TODO: notify thumbnail request and prioritize before serving

	thumbnailBase := os.DirFS(thumbnailFolder)
	expectedThumbnailPath := filePath + ".webp"
	http.ServeFileFS(w, r, thumbnailBase, expectedThumbnailPath)
}

func init() {
	approutes.Routes = append(approutes.Routes, &thumbnailRouter{})
}
