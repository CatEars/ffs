package appmiddlewares

import (
	"catears/ffs/goapp/resources"
	"catears/ffs/lib/middlewares"
	"catears/ffs/lib/router"
	"catears/ffs/lib/security"
	"context"
	"net/http"
)

func checkTabClaim(claims []*security.Claim, c *security.Claim) bool {
	return resources.AppTabsResources.AnyHasAccess(c, claims...)
}

func buildUserTabs(r *http.Request) []AppTab {
	claims := middlewares.LookupClaims(r)
	tabs := []AppTab{}

	if checkTabClaim(claims, resources.CanSeeHomeTabClaim) {
		tabs = append(tabs, AppTab{
			Name: "Files",
			Link: "/home/",
		})
	}

	if checkTabClaim(claims, resources.CanSeeShareTabClaim) {
		tabs = append(tabs, AppTab{
			Name: "Share",
			Link: "/share-file/",
		})
	}

	if checkTabClaim(claims, resources.CanSeeLogsTabClaim) {
		tabs = append(tabs, AppTab{
			Name: "Logs",
			Link: "/logs/",
		})
	}

	if checkTabClaim(claims, resources.CanSeeAdminTabClaim) {
		tabs = append(tabs, AppTab{
			Name: "Admin",
			Link: "/admin/",
		})
	}

	return tabs
}

var BuildAppTabsContext router.Middleware = func(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		appState := r.Context().Value(AppStateContextKey()).(*AppState)
		if appState != nil {
			appState.Tabs = buildUserTabs(r)
			next.ServeHTTP(w, r)
		} else {
			next.ServeHTTP(w, r.WithContext(context.WithValue(r.Context(), AppStateContextKey(), appState)))
		}
	})
}
