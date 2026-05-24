package approutes

import (
	"catears/ffs/lib/middlewares"
	"catears/ffs/lib/router"
)

func BuildAppRouter() *router.Router {
	var appRoutes = router.NewRouter()
	appRoutes.Use(middlewares.RequestLoggingMiddleware)
	registerRoutes(appRoutes)
	return appRoutes
}
