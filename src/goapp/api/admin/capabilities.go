package admin

import (
	"catears/ffs/goapp/appmiddlewares"
	"catears/ffs/lib/router"
	"net/http"
)

type capabilitiesRoutes struct{}

func (*capabilitiesRoutes) ServeHTTP(w http.ResponseWriter, r *http.Request) {

}

func Register(appRouter router.Router) {
	appRouter.With(appmiddlewares.EnsureIsRoot()).Get("/api/admin/capabilities", &capabilitiesRoutes{})
}
