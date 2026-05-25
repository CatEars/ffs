package middlewares

import (
	"catears/ffs/lib/router"
	"catears/ffs/lib/security"
	"net/http"
)

func BuildClaimEnsurer(mgr *security.ResourceManager, requestedClaim *security.Claim) router.Middleware {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			principalClaims := LookupClaims(r)
			access := mgr.AnyHasAccess(requestedClaim, principalClaims...)
			if access {
				next.ServeHTTP(w, r)
			} else {
				w.WriteHeader(http.StatusForbidden)
			}
		})
	}
}
