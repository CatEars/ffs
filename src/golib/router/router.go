package router

import (
	"log"
	"net/http"
	"strings"
)

type Middleware = func(next http.Handler) http.Handler

type Router interface {
	Use(middleware Middleware)

	Get(path string, handler http.Handler)

	Post(path string, handler http.Handler)

	Put(path string, handler http.Handler)

	Delete(path string, handler http.Handler)

	With(middlewares ...Middleware) Router

	Without() Router

	MatchAndCall(w http.ResponseWriter, r *http.Request) bool
}

type baseRouter struct {
	middlewareChain []Middleware
	routes          map[string]map[string]http.Handler
}

func NewRouter() Router {
	return &baseRouter{
		middlewareChain: []Middleware{},
		routes:          map[string]map[string]http.Handler{},
	}
}

func (router baseRouter) register(method, path string, handler http.Handler) {
	log.Printf("Registering %s %s", method, path)
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

func (router baseRouter) match(method, path string) *http.Handler {
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

func (router *baseRouter) wrapInCurrentMiddlewares(handler http.Handler) http.Handler {
	current := handler
	for i := len(router.middlewareChain) - 1; i >= 0; i -= 1 {
		current = router.middlewareChain[i](current)
	}
	return current
}

func (router *baseRouter) Use(middleware Middleware) {
	router.middlewareChain = append(router.middlewareChain, middleware)
}

func (router *baseRouter) Get(path string, handler http.Handler) {
	router.register("GET", path, handler)
}

func (router *baseRouter) Post(path string, handler http.Handler) {
	router.register("POST", path, handler)
}

func (router *baseRouter) Put(path string, handler http.Handler) {
	router.register("PUT", path, handler)
}

func (router *baseRouter) Delete(path string, handler http.Handler) {
	router.register("DELETE", path, handler)
}

func (router *baseRouter) With(middlewares ...Middleware) Router {
	return &wrappingRouter{
		middlewareChain: middlewares,
		wrappedRouter:   router,
	}
}

func (router *baseRouter) Without() Router {
	return &baseRouter{
		middlewareChain: []Middleware{},
		routes:          router.routes,
	}
}

func (router *baseRouter) MatchAndCall(w http.ResponseWriter, r *http.Request) bool {
	matchingRoute := router.match(r.Method, r.URL.Path)
	if matchingRoute == nil {
		return false
	}

	(*matchingRoute).ServeHTTP(w, r)
	return true
}

type wrappingRouter struct {
	middlewareChain []Middleware
	wrappedRouter   Router
}

func (router *wrappingRouter) wrapHandler(handler http.Handler) http.Handler {
	current := handler
	for i := len(router.middlewareChain) - 1; i >= 0; i -= 1 {
		current = router.middlewareChain[i](current)
	}
	return current
}

func (router *wrappingRouter) Use(middleware Middleware) {
	router.wrappedRouter.Use(middleware)
}

func (router *wrappingRouter) Get(path string, handler http.Handler) {
	router.wrappedRouter.Get(path, router.wrapHandler(handler))
}

func (router *wrappingRouter) Post(path string, handler http.Handler) {
	router.wrappedRouter.Post(path, router.wrapHandler(handler))
}

func (router *wrappingRouter) Put(path string, handler http.Handler) {
	router.wrappedRouter.Put(path, router.wrapHandler(handler))
}

func (router *wrappingRouter) Delete(path string, handler http.Handler) {
	router.wrappedRouter.Delete(path, router.wrapHandler(handler))
}

func (router *wrappingRouter) With(middlewares ...Middleware) Router {
	return &wrappingRouter{
		middlewareChain: middlewares,
		wrappedRouter:   router,
	}
}

func (router *wrappingRouter) Without() Router {
	return router.wrappedRouter.Without()
}

func (router *wrappingRouter) MatchAndCall(w http.ResponseWriter, r *http.Request) bool {
	return router.wrappedRouter.MatchAndCall(w, r)
}
