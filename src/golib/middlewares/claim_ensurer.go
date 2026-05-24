package middlewares

import (
	"catears/ffs/lib/router"
	"catears/ffs/lib/security"
	"net/http"
)

func BuildClaimEnsurer(claimVerifier *security.ClaimVerifier, requestedClaim *security.Claim) router.Middleware {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			principalClaims := LookupClaims(r)
			for _, claim := range principalClaims {
				if claimVerifier.HasAccessFunc(requestedClaim, claim) {
					next.ServeHTTP(w, r)
					return
				}
			}

			w.WriteHeader(http.StatusForbidden)
		})
	}
}
