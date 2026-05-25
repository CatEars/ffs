package approutes

import (
	apiadmin "catears/ffs/goapp/api/admin"
	apiuserlogon "catears/ffs/goapp/api/user-logon"
	"catears/ffs/lib/router"
)

func registerRoutes(appRouter router.Router) {
	apiuserlogon.Register(appRouter)
	apiadmin.Register(appRouter)
}
