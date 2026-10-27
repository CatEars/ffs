package main

import (
	approutes "catears/ffs/goapp/app-routes"
	"catears/ffs/goapp/config"
	"crypto/tls"
	"embed"
	"log"
	"net/http"
	"os"
	"time"
)

type FfsHandler struct {
}

//go:embed website/*
var websiteContent embed.FS

var appRouter = approutes.BuildAppRouter(websiteContent)

func (h *FfsHandler) ServeHTTP(w http.ResponseWriter, r *http.Request) {
	// TODO: Handle non-matching web calls
	appRouter.MatchAndCall(w, r)
}

func main() {
	handler := &FfsHandler{}
	address := ":8080"
	log.Println("Serving GO app on", address)
	RunStartup()
	certFile := config.Config.CertFile()
	keyFile := config.Config.CertKeyFile()
	_, certFileErr := os.ReadFile(certFile)
	_, keyFileErr := os.ReadFile(keyFile)
	tlsConfigError := certFileErr != nil || keyFileErr != nil

	if !tlsConfigError && certFile != "" && keyFile != "" {
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
		// TODO: How best to handle "strict" (fail on TLS not configured) vs. "lax" (downgrade on TLS not configured)?
		log.Fatal(http.ListenAndServe(address, handler))
	}
}
