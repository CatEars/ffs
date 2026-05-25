package approutes

import (
	"catears/ffs/goapp/appmiddlewares"
	"catears/ffs/lib/middlewares"
	"catears/ffs/lib/router"
)

func BuildAppRouter() router.Router {
	appmiddlewares.BuildMiddlewares()

	var appRoutes = router.NewRouter()
	appRoutes.Use(middlewares.RequestLoggingMiddleware)
	appRoutes.Use(appmiddlewares.UserLookup)
	registerRoutes(appRoutes)
	return appRoutes
}
