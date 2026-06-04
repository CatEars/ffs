package main

import (
	approutes "catears/ffs/goapp/app-routes"
	"catears/ffs/goapp/config"
	"crypto/tls"
	"log"
	"net/http"
	"net/http/httputil"
	"net/url"
	"time"
)

type FfsHandler struct {
}

var proxyTarget, _ = url.Parse("http://localhost:8081")
var proxy *httputil.ReverseProxy = httputil.NewSingleHostReverseProxy(proxyTarget)
var appRouter = approutes.BuildAppRouter(WebsiteContent)

func (h *FfsHandler) ServeHTTP(w http.ResponseWriter, r *http.Request) {
	matched := appRouter.MatchAndCall(w, r)
	if !matched {
		proxy.ServeHTTP(w, r)
	}
}

func main() {
	handler := &FfsHandler{}
	address := ":8080"
	log.Println("Serving GO app with deno proxy on", address)
	RunStartup()
	certFile := config.Config.CertFile()
	keyFile := config.Config.CertKeyFile()
	if certFile != "" && keyFile != "" {
		cfg := &tls.Config{
			MinVersion: tls.VersionTLS13,
			CurvePreferences: []tls.CurveID{
				tls.X25519,
				tls.CurveP256,
			},
		}
		server := &http.Server{
			Addr:         address,
			Handler:      handler,
			TLSConfig:    cfg,
			ReadTimeout:  15 * time.Second,
			WriteTimeout: 15 * time.Second,
			IdleTimeout:  15 * time.Second,
		}
		log.Fatal(server.ListenAndServeTLS(certFile, keyFile))
	} else {
		log.Fatal(http.ListenAndServe(address, handler))
	}
}
