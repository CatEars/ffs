package thumbnail

import (
	approutes "catears/ffs/goapp/app-routes"
	"catears/ffs/goapp/appmiddlewares"
	"catears/ffs/goapp/cache"
	"catears/ffs/lib/router"
	"catears/ffs/lib/security"
	"net/http"
	"path"
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
	
	d := path.Dir(filePath)
	f := path.Base(filePath)
	// TODO: `filePath` is user input, ensure access
	thumbnailFolder := cache.ThumbnailsFolder.Sub(d)
	d, err := thumbnailFolder.Get()
	if err != nil {
		w.WriteHeader(http.StatusNotFound)
		return
	}

	// TODO: notify thumbnail request and prioritize before serving

	expectedThumbnailPath := path.Join(d, f + ".webp")
	http.ServeFile(w, r, expectedThumbnailPath)
}

func init() {
	approutes.Routes = append(approutes.Routes, &thumbnailRouter{})
}
