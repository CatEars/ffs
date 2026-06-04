package appmiddlewares

import (
	"catears/ffs/lib/router"
	"context"
	"net/http"
)

type AppTab struct {
	Name string
	Link string
}

type AppState struct {
	Tabs []AppTab
}

type appStateKey string

func AppStateContextKey() appStateKey {
	return appStateKey("appstatekey")
}

func NewAppState() *AppState {
	return &AppState{
		Tabs: []AppTab{},
	}
}

var InitializeAppStateContext router.Middleware = func(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		next.ServeHTTP(w, r.WithContext(context.WithValue(r.Context(), AppStateContextKey(), NewAppState())))
	})
}
