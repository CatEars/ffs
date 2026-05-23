package approutes

import "catears/ffs/lib/router"

func BuildAppRouter() *router.Router {
	var appRoutes = router.NewRouter()
	registerRoutes(appRoutes)
	return appRoutes
}
