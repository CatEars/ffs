package admin

import (
	approutes "catears/ffs/goapp/app-routes"
	"catears/ffs/goapp/resources"
	"catears/ffs/lib/middlewares"
	"catears/ffs/lib/router"
	"net/http"
)

type capabilitiesRoutes struct{}

type capabilities struct {
	CanCreateUsers    bool `json:"canCreateUsers"`
	AllowHousekeeping bool `json:"allowHousekeeping"`
}

func (self *capabilitiesRoutes) Register(appRouter router.Router) {
	appRouter.Get("/api/admin/capabilities", &capabilitiesRoutes{})
}

func (*capabilitiesRoutes) ServeHTTP(w http.ResponseWriter, r *http.Request) {
	claims := middlewares.LookupClaims(r)

	var cap = &capabilities{
		CanCreateUsers:    resources.AdminResource.AnyHasAccess(resources.CreateUserClaim, claims...),
		AllowHousekeeping: resources.AdminResource.AnyHasAccess(resources.HousekeepingClaim, claims...),
	}

	router.JsonResponse(w, cap)
}

func init() {
	approutes.Routes = append(approutes.Routes, &capabilitiesRoutes{})
}
