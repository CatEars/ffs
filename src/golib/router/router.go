package router

import (
	"log"
	"net/http"
	"strings"
)

type Middleware = func(next http.Handler) http.Handler

type Router struct {
	middlewareChain []Middleware
	routes          map[string]map[string]http.Handler
}

func NewRouter() *Router {
	return &Router{
		middlewareChain: []Middleware{},
		routes:          map[string]map[string]http.Handler{},
	}
}

func (router *Router) register(method, path string, handler http.Handler) {
	method = strings.ToLower(method)
	path = strings.ToLower(path)

	inner, ok := router.routes[method]
	if !ok {
		router.routes[method] = make(map[string]http.Handler)
		inner = router.routes[method]
	}

	_, ok = inner[path]
	if ok {
		log.Panicf("Registering path HTTP %s %s for the second time is not possible", method, path)
	}

	inner[path] = router.wrapInCurrentMiddlewares(handler)
}

func (router *Router) match(method, path string) *http.Handler {
	method = strings.ToLower(method)
	path = strings.ToLower(path)
	inner, ok := router.routes[method]
	if !ok {
		return nil
	}

	route, ok := inner[path]
	if !ok {
		return nil
	}

	return &route
}

func (router *Router) wrapInCurrentMiddlewares(handler http.Handler) http.Handler {
	current := handler
	for i := len(router.middlewareChain) - 1; i >= 0; i -= 1 {
		current = router.middlewareChain[i](current)
	}
	return current
}

func (router *Router) Use(middleware Middleware) {
	router.middlewareChain = append(router.middlewareChain, middleware)
}

func (router *Router) Get(path string, handler http.Handler) {
	router.register("GET", path, handler)
}

func (router *Router) Post(path string, handler http.Handler) {
	router.register("POST", path, handler)
}

func (router *Router) Put(path string, handler http.Handler) {
	router.register("PUT", path, handler)
}

func (router *Router) Delete(path string, handler http.Handler) {
	router.register("DELETE", path, handler)
}

func (router *Router) MatchAndCall(w http.ResponseWriter, r *http.Request) bool {
	matchingRoute := router.match(r.Method, r.URL.Path)
	if matchingRoute == nil {
		return false
	}

	(*matchingRoute).ServeHTTP(w, r)
	return true
}
