package main

import (
	approutes "catears/ffs/goapp/app-routes"
	"catears/ffs/goapp/config"
	"catears/ffs/lib/ffslog"
	"catears/ffs/lib/router"
	"catears/ffs/lib/safefs"
	"context"
	"crypto/tls"
	"embed"
	"io/fs"
	"net/http"
	"os"
	"os/signal"
	"path"
	"strings"
	"syscall"
	"time"
)

type FfsHandler struct {
}

//go:embed website/*
var websiteContent embed.FS

var appRouter router.Router

func isApiCall(r *http.Request) bool {
	return strings.HasPrefix(strings.ToLower(r.URL.Path), "/api/")
}

func isStaticFileRequest(r *http.Request) bool {
	return strings.HasPrefix(strings.ToLower(r.URL.Path), "/static/")
}

func (h *FfsHandler) ServeHTTP(w http.ResponseWriter, r *http.Request) {
	called := appRouter.MatchAndCall(w, r)
	if !called {
		if isApiCall(r) || isStaticFileRequest(r) {
			w.WriteHeader(http.StatusNotFound)
		} else {
			http.Redirect(w, r, "/", http.StatusSeeOther)
		}
	}
}

func getSiteContent() fs.FS {
	pwd, err := os.Getwd()
	if err != nil {
		pwd = "."
	}
	goappDir := path.Join(pwd, "src", "goapp")

	// If in dev mode, and running from source control root
	if config.Config.DevMode() && safefs.DirExists(goappDir) {
		return os.DirFS(goappDir)
	}

	// Else we provide from executable built-in HTML/CSS/JS content
	return websiteContent
}

func main() {
	handler := &FfsHandler{}
	address := ":8080"
	ffslog.Printf("Serving API on %s", address)
	ctx, stop := signal.NotifyContext(context.Background(), os.Interrupt, syscall.SIGTERM)
	defer stop()
	RunStartup(ctx)
	appRouter = approutes.BuildAppRouter(getSiteContent())
	certFile := config.Config.CertFile()
	keyFile := config.Config.CertKeyFile()
	_, certFileErr := os.ReadFile(certFile)
	_, keyFileErr := os.ReadFile(keyFile)
	tlsConfigError := certFileErr != nil || keyFileErr != nil
	server := &http.Server{
		Addr:         address,
		Handler:      handler,
		ReadTimeout:  15 * time.Second,
		WriteTimeout: 15 * time.Second,
		IdleTimeout:  15 * time.Second,
	}

	go func() {
		<-ctx.Done()
		ctx, stop := context.WithTimeout(context.Background(), time.Second*5)
		defer stop()
		server.Shutdown(ctx)
	}()

	if !tlsConfigError && certFile != "" && keyFile != "" {
		cfg := &tls.Config{
			MinVersion: tls.VersionTLS13,
			CurvePreferences: []tls.CurveID{
				tls.X25519,
				tls.CurveP256,
			},
		}
		server.TLSConfig = cfg
		ffslog.Fatal(server.ListenAndServeTLS(certFile, keyFile))
	} else {
		// TODO: How best to handle "strict" (fail on TLS not configured) vs. "lax" (downgrade on TLS not configured)?
		ffslog.Fatal(server.ListenAndServe())
	}
}
