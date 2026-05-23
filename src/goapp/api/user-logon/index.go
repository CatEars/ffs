package userlogon

import (
	"catears/ffs/goapp/config"
	usermanager "catears/ffs/goapp/user-manager"
	"catears/ffs/lib/router"
	"catears/ffs/lib/security"
	"catears/ffs/lib/users"
	"encoding/base64"
	"encoding/json"
	"net/http"
)

type userLogonHandler struct{}

func newUserHandler() *userLogonHandler {
	return &userLogonHandler{}
}

type SignedClaims struct {
	Claims    string `json:"claims"`
	Signature string `json:"hmac"`
}

func deriveLegacyApiKey(user string) (string, error) {
	claim := usermanager.UserResources().GetClaim(security.StandardAccess.Write(), user)
	c := "[" + claim.LegacyString() + "]"
	signature, err := security.SignBlob([]byte(config.Config.InstanceSecret()), []byte(c))
	b64ed := base64.StdEncoding.EncodeToString(signature)
	if err != nil {
		return "", err
	}
	auth := SignedClaims{
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
	marshalled, err := json.Marshal(claims)
	if err != nil {
		return "", err
	}
	signature, err := security.SignBlob([]byte(config.Config.InstanceSecret()), []byte(marshalled))
	if err != nil {
		return "", err
	}
	b64ed := base64.StdEncoding.EncodeToString(signature)
	auth := SignedClaims{
		Claims:    string(marshalled),
		Signature: b64ed,
	}
	formatted, err := json.Marshal(auth)
	if err != nil {
		return "", err
	}

	return base64.URLEncoding.EncodeToString(formatted), nil
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
		w.Header().Add("Location", "/logon/fail")
		w.WriteHeader(http.StatusFound)
		return
	}

	legacyLogonCookie := &http.Cookie{}
	legacyLogonCookie.Name = "Ffs-Authorization"
	legacyApiKey, err := deriveLegacyApiKey(usr.Username)
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		return
	}
	legacyLogonCookie.Value = legacyApiKey
	legacyLogonCookie.Path = "/"
	legacyLogonCookie.HttpOnly = true
	http.SetCookie(w, legacyLogonCookie)

	modernLogonCookie := &http.Cookie{}
	modernLogonCookie.Name = "Ffs-Auth"
	modernApiKey, err := deriveModernApiKey(usr)
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		return
	}
	modernLogonCookie.Value = modernApiKey
	modernLogonCookie.Path = "/"
	modernLogonCookie.HttpOnly = true
	http.SetCookie(w, modernLogonCookie)
	w.Header().Add("Location", "/home/")
	w.WriteHeader(http.StatusFound)
}

func Register(appRouter *router.Router) {
	appRouter.Post("/api/user-logon", newUserHandler())
}
