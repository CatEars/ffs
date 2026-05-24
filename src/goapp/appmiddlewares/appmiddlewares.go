package appmiddlewares

import (
	"catears/ffs/goapp/config"
	usermanager "catears/ffs/goapp/user-manager"
	"catears/ffs/lib/middlewares"
	"catears/ffs/lib/router"
	"catears/ffs/lib/security"
)

var UserLookup router.Middleware = nil

var rootClaimVerifier = &security.ClaimVerifier{
	HasAccessFunc: security.DefaultClaimVerificationFunc,
}

func EnsureIsRoot() router.Middleware {
	return middlewares.BuildClaimEnsurer(rootClaimVerifier, &security.RootClaim)
}

func EnsureClaim(mgr *security.ResourceManager, claim *security.Claim) router.Middleware {
	return middlewares.BuildClaimEnsurer(mgr.Verifier, claim)
}

func BuildMiddlewares() {
	UserLookup = middlewares.BuildUserLookupMiddleware(
		usermanager.UserManager(),
		config.Config.InstanceSecret())
}
