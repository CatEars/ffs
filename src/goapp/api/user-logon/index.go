package userlogon

import (
	approutes "catears/ffs/goapp/app-routes"
	"catears/ffs/goapp/config"
	usermanager "catears/ffs/goapp/user-manager"
	"catears/ffs/lib/router"
	"catears/ffs/lib/security"
	"catears/ffs/lib/users"
	"encoding/base64"
	"encoding/json"
	"net/http"
	"strings"
)

type userLogonHandler struct{}

func (self *userLogonHandler) Register(appRouter router.Router) {
	appRouter.Post("/api/user-logon", self)
}

func deriveLegacyApiKey(user string) (string, error) {
	claim := usermanager.UserResources().GetClaim(security.StandardAccess.Write(), user)
	c := "[" + claim.LegacyString() + "]"
	signature, err := security.SignBlob(config.Config.InstanceSecret(), []byte(c))
	b64ed := base64.StdEncoding.EncodeToString(signature)
	if err != nil {
		return "", err
	}
	auth := security.LegacySignedClaims{
		Claims:    c,
		Signature: b64ed,
	}
	formatted, err := json.Marshal(auth)
	if err != nil {
		return "", err
	}
	return base64.URLEncoding.EncodeToString(formatted), nil
}

func deriveModernApiKey(record *users.UserRecord) (string, error) {
	claims := record.Claims
	builder := strings.Builder{}
	for _, v := range claims {
		_, err := builder.WriteString(v.String())
		if err != nil {
			return "", err
		}
	}

	signature, err := security.SignBlob(config.Config.InstanceSecret(), []byte(builder.String()))
	if err != nil {
		return "", err
	}
	b64ed := base64.StdEncoding.EncodeToString(signature)
	auth := security.ModernSignedClaims{
		Claims:    claims,
		Signature: b64ed,
	}
	formatted, err := json.Marshal(auth)
	if err != nil {
		return "", err
	}

	return base64.URLEncoding.EncodeToString(formatted), nil
}

func makeBaseCookie(name string) *http.Cookie {
	cookie := &http.Cookie{}
	cookie.Name = name
	cookie.Path = "/"
	cookie.HttpOnly = true
	return cookie
}

func (*userLogonHandler) ServeHTTP(w http.ResponseWriter, r *http.Request) {
	username := r.FormValue("username")
	password := r.FormValue("password")
	if username == "" || password == "" {
		w.WriteHeader(http.StatusBadRequest)
		return
	}

	usr := usermanager.UserManager().MatchUser(username, password)

	if usr == nil {
		http.Redirect(w, r, "/logon/fail", http.StatusFound)
		return
	}

	legacyLogonCookie := makeBaseCookie("FFS-Authorization")
	legacyApiKey, err := deriveLegacyApiKey(usr.Username)
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		return
	}
	legacyLogonCookie.Value = legacyApiKey
	http.SetCookie(w, legacyLogonCookie)

	modernLogonCookie := makeBaseCookie("FFS-Auth")
	modernApiKey, err := deriveModernApiKey(usr)
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		return
	}
	modernLogonCookie.Value = modernApiKey
	http.SetCookie(w, modernLogonCookie)

	http.Redirect(w, r, "/home/", http.StatusFound)
}

func init() {
	approutes.Routes = append(approutes.Routes, &userLogonHandler{})
}
