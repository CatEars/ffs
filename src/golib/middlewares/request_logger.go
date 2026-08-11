package middlewares

import (
	"fmt"
	"log"
	"net/http"
	"regexp"
)

func getSource(r *http.Request) string {
	forwarded := r.Header.Get("X-Forwarded-For")
	if forwarded != "" {
		return forwarded
	}
	return r.RemoteAddr
}

func BuildRequestLoggingMiddleware(blacklist *regexp.Regexp) func(http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			source := getSource(r)
			// URLs may contain secret information in search params. Focus on path only
			nonSecretUrl := fmt.Sprintf("%s://%s%s", r.Proto, r.Host, r.URL.Path)
			if !blacklist.Match([]byte(nonSecretUrl)) {
				log.Printf("%s -> %s", source, nonSecretUrl)
			}
			next.ServeHTTP(w, r)
		})
	}
}
