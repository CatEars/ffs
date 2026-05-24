package router

import "net/http"

// Redirects request to `path`
func RedirectTo(w http.ResponseWriter, path string) {
	w.Header().Add("Location", path)
	w.WriteHeader(http.StatusFound)
}
