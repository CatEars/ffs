package approutes

import (
	"catears/ffs/goapp/config"
	usermanager "catears/ffs/goapp/user-manager"
	"catears/ffs/lib/middlewares"
	"catears/ffs/lib/router"
)

func BuildAppRouter() *router.Router {
	var appRoutes = router.NewRouter()
	appRoutes.Use(middlewares.RequestLoggingMiddleware)
	appRoutes.Use(
		middlewares.BuildUserLookupMiddleware(
			usermanager.UserManager(),
			config.Config.InstanceSecret()))
	registerRoutes(appRoutes)
	return appRoutes
}
