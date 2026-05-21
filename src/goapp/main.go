package main

import (
	userlogon "catears/ffs/goapp/api/user-logon"
	"log"
	"net/http"
	"net/http/httputil"
	"net/url"
)

type FfsHandler struct {
}

var proxyTarget, _ = url.Parse("http://localhost:8081")
var proxy *httputil.ReverseProxy = httputil.NewSingleHostReverseProxy(proxyTarget)
var userApi = userlogon.NewUserHandler()

type matcher struct {
	Method  string
	Path    string
	Handler http.Handler
}

func (h *FfsHandler) ServeHTTP(w http.ResponseWriter, r *http.Request) {
	var matchers = []matcher{
		{
			Method:  "POST",
			Path:    "/api/user-logon",
			Handler: userApi,
		},
	}

	for _, v := range matchers {
		if v.Method == r.Method && v.Path == r.URL.Path {
			v.Handler.ServeHTTP(w, r)
			return
		}
	}

	proxy.ServeHTTP(w, r)
}

func main() {
	handler := &FfsHandler{}
	port := ":8080"
	log.Println("Serving GO app with deno proxy on", port)
	RunStartup()
	log.Fatal(http.ListenAndServe(port, handler))
}
