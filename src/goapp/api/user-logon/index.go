package userlogon

import (
	"catears/ffs/goapp/config"
	usermanager "catears/ffs/goapp/user-manager"
	"catears/ffs/lib/security"
	"encoding/base64"
	"encoding/json"
	"log"
	"net/http"
)

type userLogonHandler struct{}

func NewUserHandler() *userLogonHandler {
	return &userLogonHandler{}
}

type legacyAuth struct {
	Claims string `json:"claims"`
	Hmac   string `json:"hmac"`
}

func deriveLegacyApiKey(user string) (string, error) {
	claim := usermanager.UserResources().GetClaim(security.StandardAccess.Write(), user)
	c := "[" + claim.LegacyString() + "]"
	signature, err := security.SignBlob([]byte(config.Config.InstanceSecret()), []byte(c))
	b64ed := base64.URLEncoding.EncodeToString(signature)
	if err != nil {
		return "", err
	}
	auth := legacyAuth{
		Claims: c,
		Hmac:   b64ed,
	}
	formatted, err := json.Marshal(auth)
	if err != nil {
		return "", err
	}
	return base64.URLEncoding.EncodeToString(formatted), nil
}

/*
HTTP/2 302
content-type: text/plain; charset=UTF-8
date: Mon, 18 May 2026 19:14:43 GMT
location: /home/
set-cookie: FFS-Authorization=...; path=/; httponly
set-cookie: FFS-Csrf-Protection=...; path=/
vary: Accept-Encoding
content-length: 22
X-Firefox-Spdy: h2
*/
func (*userLogonHandler) ServeHTTP(w http.ResponseWriter, r *http.Request) {
	username := r.FormValue("username")
	password := r.FormValue("password")
	log.Printf("Logging on with %s:%s", username, password)
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
		log.Printf("OH NOES %s", err)
		w.WriteHeader(http.StatusInternalServerError)
		return
	}
	log.Printf("COOKIE %s", legacyApiKey)
	legacyLogonCookie.Value = legacyApiKey
	legacyLogonCookie.Path = "/"
	legacyLogonCookie.HttpOnly = true
	http.SetCookie(w, legacyLogonCookie)
	modernLogonCookie := &http.Cookie{}
	modernLogonCookie.Name = "Ffs-Auth"

	modernLogonCookie.Value = "123" + usr.Username
	modernLogonCookie.Path = "/"
	modernLogonCookie.HttpOnly = true
	http.SetCookie(w, modernLogonCookie)
	w.Header().Add("Location", "/home/")
	w.WriteHeader(http.StatusFound)
}
