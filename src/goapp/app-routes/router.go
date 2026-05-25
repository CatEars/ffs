package approutes

import (
	"catears/ffs/goapp/appmiddlewares"
	"catears/ffs/lib/middlewares"
	"catears/ffs/lib/router"
)

type FfsRoute interface {
	Register(router.Router)
}

var Routes []FfsRoute = []FfsRoute{}

func BuildAppRouter() router.Router {
	appmiddlewares.BuildMiddlewares()

	var appRoutes = router.NewRouter()
	appRoutes.Use(middlewares.RequestLoggingMiddleware)
	appRoutes.Use(appmiddlewares.UserLookup)
	for _, route := range Routes {
		route.Register(appRoutes)
	}
	return appRoutes
}
