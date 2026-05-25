package admin

import (
	"catears/ffs/goapp/cache"
	"log"
	"net/http"
	"net/url"
)

type clearManifestRouter struct{}

func (*clearManifestRouter) ServeHTTP(w http.ResponseWriter, r *http.Request) {
	err := cache.ClearManifestsDirAndEnsureExists()
	if err != nil {
		log.Printf("WARN %s", err)
		w.WriteHeader(http.StatusInternalServerError)
	} else {
		log.Println("Cleared share link manifests directory")
		referer := r.Header.Get("Referer")
		if referer == "" {
			referer = "/"
		}
		parsed, err := url.Parse(referer)
		if err != nil {
			parsed.Path = "/"
		}
		log.Printf("Redirecting to %s", parsed)
		redirectUrl := url.URL{}
		redirectUrl.Path = parsed.Path
		params := url.Values{}
		params.Add("message", "Share link manifests cleared")
		redirectUrl.RawQuery = params.Encode()
		http.Redirect(w, r, redirectUrl.String(), http.StatusFound)
	}
}
