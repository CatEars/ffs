package middlewares

import (
	"catears/ffs/lib/router"
	"catears/ffs/lib/security"
	"catears/ffs/lib/users"
	"context"
	"encoding/base64"
	"encoding/json"
	"log"
	"net/http"
	"strings"
)

type userClaimsKey string

func LookupClaims(r *http.Request) []*security.Claim {
	claims := r.Context().Value(userClaimsKey("claims"))
	return claims.([]*security.Claim)
}

func BuildUserLookupMiddleware(userManager *users.UserManager, instanceKey []byte) router.Middleware {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			cookie, err := r.Cookie("FFS-Auth")
			if err != nil {
				next.ServeHTTP(w, r)
				return
			}

			err = cookie.Valid()
			if err != nil {
				log.Printf("WARN - FFS-Auth cookie is not valid, skipping user")
				next.ServeHTTP(w, r)
				return
			}

			auth := cookie.Value
			if auth == "" {
				next.ServeHTTP(w, r)
				return
			}
			unb64ed, err := base64.URLEncoding.DecodeString(auth)
			if err != nil {
				log.Printf("WARN - User tried to log on but got %s", err)
				w.WriteHeader(http.StatusInternalServerError)
				return
			}

			into := &security.ModernSignedClaims{}
			err = json.Unmarshal(unb64ed, into)
			if err != nil {
				log.Printf("WARN - User tried to log on but got %s", err)
				w.WriteHeader(http.StatusInternalServerError)
				return
			}
			builder := strings.Builder{}
			for _, v := range into.Claims {
				_, err := builder.WriteString(v.String())
				if err != nil {
					log.Printf("WARN - User tried to log on but got %s", err)
					w.WriteHeader(http.StatusInternalServerError)
					return
				}
			}
			signature, err := security.SignBlob(instanceKey, []byte(builder.String()))
			b64edSig := base64.StdEncoding.EncodeToString(signature)
			if b64edSig != into.Signature {
				log.Printf("WARN - User tried to log on but signature did not match claims")
				w.WriteHeader(http.StatusInternalServerError)
				return
			}

			nextContext := context.WithValue(r.Context(), userClaimsKey("claims"), into.Claims)
			next.ServeHTTP(w, r.WithContext(nextContext))
		})
	}
}
