package approutes

import (
	"catears/ffs/goapp/appmiddlewares"
	"catears/ffs/lib/middlewares"
	"catears/ffs/lib/router"
)

func BuildAppRouter() router.Router {
	var appRoutes = router.NewRouter()
	appRoutes.Use(middlewares.RequestLoggingMiddleware)
	appmiddlewares.BuildMiddlewares()
	registerRoutes(appRoutes)
	return appRoutes
}
