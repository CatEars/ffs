package appmiddlewares

import (
	"catears/ffs/goapp/config"
	usermanager "catears/ffs/goapp/user-manager"
	"catears/ffs/lib/middlewares"
	"catears/ffs/lib/router"
	"catears/ffs/lib/security"
	"net/http"
)

var UserLookup router.Middleware = nil

var rootClaimVerifier = &security.ClaimVerifier{
	HasAccessFunc: security.DefaultClaimVerificationFunc,
}
var rootResourceManager = security.NewResourceManagerWithVerifier("root", rootClaimVerifier)

var EnsureIsRoot = middlewares.BuildClaimEnsurer(rootResourceManager, &security.RootClaim)

func EnsureClaim(mgr *security.ResourceManager, claim *security.Claim) router.Middleware {
	return middlewares.BuildClaimEnsurer(mgr, claim)
}

var crossOriginProtection = http.NewCrossOriginProtection()

func CsrfProtect(next http.Handler) http.Handler {
	return crossOriginProtection.Handler(next)
}

func BuildMiddlewares() {
	UserLookup = middlewares.BuildUserLookupMiddleware(
		usermanager.UserManager(),
		config.Config.InstanceSecret())
}
