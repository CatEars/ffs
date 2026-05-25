package admin

import (
	"catears/ffs/goapp/appmiddlewares"
	"catears/ffs/goapp/resources"
	"catears/ffs/lib/middlewares"
	"catears/ffs/lib/router"
	"catears/ffs/lib/security"
	"net/http"
)

type capabilitiesRoutes struct{}

type capabilities struct {
	CanCreateUsers    bool `json:"canCreateUsers"`
	AllowHousekeeping bool `json:"allowHousekeeping"`
}

var createUserClaim = resources.AdminResource.GetClaim(security.StandardAccess.Write(), "CreateUser")
var housekeepingClaim = resources.AdminResource.GetClaim(security.StandardAccess.Write(), "Housekeeping")

func (*capabilitiesRoutes) ServeHTTP(w http.ResponseWriter, r *http.Request) {
	claims := middlewares.LookupClaims(r)

	var cap = &capabilities{
		CanCreateUsers:    resources.AdminResource.AnyHasAccess(createUserClaim, claims...),
		AllowHousekeeping: resources.AdminResource.AnyHasAccess(housekeepingClaim, claims...),
	}

	router.JsonResponse(w, cap)
}

func Register(appRouter router.Router) {
	appRouter.Get("/api/admin/capabilities", &capabilitiesRoutes{})

	appRouter.With(
		appmiddlewares.CsrfProtect,
		appmiddlewares.EnsureClaim(resources.AdminResource, housekeepingClaim)).Post("/api/admin/clear-manifests", &clearManifestRouter{})
}
