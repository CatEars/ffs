package approutes

import (
	"catears/ffs/goapp/appmiddlewares"
	"catears/ffs/goapp/config"
	"catears/ffs/lib/ffslog"
	"catears/ffs/lib/microphone"
	"catears/ffs/lib/middlewares"
	"catears/ffs/lib/router"
	"io/fs"
	"net/http"
	"regexp"
)

type FfsRoute interface {
	Register(router.Router)
}

var Routes []FfsRoute = []FfsRoute{}

func buildMicrophone(websiteContent fs.FS) (*microphone.Microphone, error) {
	ct, err := fs.Sub(websiteContent, "website")

	if err != nil {
		return nil, err
	}

	return microphone.New(ct)
}

func addStaticRoutes(appRoutes router.Router, mcr *microphone.Microphone) error {
	return fs.WalkDir(mcr.StaticFiles, ".", func(path string, d fs.DirEntry, err error) error {
		if err != nil {
			return err
		}

		if d.Type().IsRegular() {
			appRoutes.Get("/static/"+path, http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
				http.ServeFileFS(w, r, mcr.StaticFiles, path)
			}))
		}

		return nil
	})
}

func addTemplateRoutes(appRoutes router.Router, mcr *microphone.Microphone) {
	for viewName := range mcr.Views {
		appRoutes.Get("/"+viewName, http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			data := r.Context().Value(appmiddlewares.AppStateContextKey()).(*appmiddlewares.AppState)
			err := mcr.ExecuteTemplate(w, viewName, data)
			if err != nil {
				ffslog.Warn("Error when executing template ", viewName, err)
				w.WriteHeader(http.StatusInternalServerError)
			}
		}))
	}
}

func BuildAppRouter(websiteContent fs.FS) router.Router {
	appmiddlewares.BuildMiddlewares()
	mcr, err := buildMicrophone(websiteContent)
	if err != nil {
		panic(err)
	}
	if config.Config.DevMode() {
		mcr.AlwaysReload = true
	}

	var appRoutes = router.NewRouter()
	err = addStaticRoutes(appRoutes, mcr)
	if err != nil {
		panic(err)
	}

	reg := regexp.MustCompile("/api/thumbnail$")
	appRoutes.Use(middlewares.BuildRequestLoggingMiddleware(reg))
	appRoutes.Use(appmiddlewares.UserLookup)
	appRoutes.Use(appmiddlewares.InitializeAppStateContext)

	for _, route := range Routes {
		route.Register(appRoutes)
	}

	appRoutes.Use(appmiddlewares.BuildAppTabsContext)
	addTemplateRoutes(appRoutes, mcr)
	return appRoutes
}
