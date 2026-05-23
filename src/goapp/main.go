package main

import (
	approutes "catears/ffs/goapp/app-routes"
	"log"
	"net/http"
	"net/http/httputil"
	"net/url"
)

type FfsHandler struct {
}

var proxyTarget, _ = url.Parse("http://localhost:8081")
var proxy *httputil.ReverseProxy = httputil.NewSingleHostReverseProxy(proxyTarget)
var appRouter = approutes.BuildAppRouter()

func (h *FfsHandler) ServeHTTP(w http.ResponseWriter, r *http.Request) {
	matched := appRouter.MatchAndCall(w, r)
	if !matched {
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
