package middlewares

import (
	"fmt"
	"log"
	"net/http"
)

func getSource(r *http.Request) string {
	forwarded := r.Header.Get("X-Forwarded-For")
	if forwarded != "" {
		return forwarded
	}
	return r.RemoteAddr
}

func RequestLoggingMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		source := getSource(r)
		// URLs may contain secret information in search params. Focus on path only
		nonSecretUrl := fmt.Sprintf("%s://%s%s", r.Proto, r.Host, r.URL.Path)
		log.Printf("%s -> %s", source, nonSecretUrl)
		next.ServeHTTP(w, r)
	})
}
