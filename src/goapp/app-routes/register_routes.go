package approutes

import (
	apiuserlogon "catears/ffs/goapp/api/user-logon"
	"catears/ffs/lib/router"
)

func registerRoutes(appRouter router.Router) {
	apiuserlogon.Register(appRouter)
}
