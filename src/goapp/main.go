package main

import (
	"log"
	"net/http"
	"net/http/httputil"
	"net/url"
)

type FfsHandler struct {
}

var proxyTarget, _ = url.Parse("http://localhost:8081")
var proxy *httputil.ReverseProxy = httputil.NewSingleHostReverseProxy(proxyTarget)

func (h *FfsHandler) ServeHTTP(w http.ResponseWriter, r *http.Request) {
	proxy.ServeHTTP(w, r)
}

func main() {
	handler := &FfsHandler{}
	port := ":8080"
	log.Println("Serving GO app with deno proxy on", port)
	log.Fatal(http.ListenAndServe(port, handler))
}
