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

func (h *FfsHandler) ServeHTTP(w http.ResponseWriter, r *http.Request) {
	if r.Method == "POST" && r.URL.Path == "/api/user-logon" {
		userApi.ServeHTTP(w, r)
	} else {
		proxy.ServeHTTP(w, r)
	}
}

func main() {
	handler := &FfsHandler{}
	port := ":8080"
	log.Println("Serving GO app with deno proxy on", port)
	RunStartup()
	log.Fatal(http.ListenAndServe(port, handler))
}
