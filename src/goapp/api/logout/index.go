package logout

import (
	approutes "catears/ffs/goapp/app-routes"
	"catears/ffs/lib/router"
	"net/http"
)

type logoutRouter struct{}

func (self *logoutRouter) Register(approuter router.Router) {
	approuter.Get("/api/logout", self)
}

func (*logoutRouter) ServeHTTP(w http.ResponseWriter, r *http.Request) {
	w.Header().Add("Clear-Site-Data", "\"cookies\"")
	http.Redirect(w, r, "/", http.StatusFound)
}

func init() {
	approutes.Routes = append(approutes.Routes, &logoutRouter{})
}
