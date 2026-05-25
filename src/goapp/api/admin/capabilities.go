package admin

import (
	"catears/ffs/goapp/appmiddlewares"
	"catears/ffs/lib/router"
	"encoding/json"
	"net/http"
)

type capabilitiesRoutes struct{}

type capabilities struct {
	CanCreateUsers    bool `json:"canCreateUsers"`
	AllowHousekeeping bool `json:"allowHousekeeping"`
}

func (*capabilitiesRoutes) ServeHTTP(w http.ResponseWriter, r *http.Request) {
	var cap = &capabilities{
		CanCreateUsers:    true,
		AllowHousekeeping: true,
	}
	body, err := json.Marshal(cap)
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		return
	}

	w.Header().Add("Content-Type", "application/json")
	w.Write(body)
}

func Register(appRouter router.Router) {
	appRouter.With(appmiddlewares.UserLookup, appmiddlewares.EnsureIsRoot).Get("/api/admin/capabilities", &capabilitiesRoutes{})
}
