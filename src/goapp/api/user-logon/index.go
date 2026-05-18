package userlogon

import (
	"net/http"
)

type userLogonHandler struct{}

func NewUserHandler() *userLogonHandler {
	return &userLogonHandler{}
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
	logonCookie := &http.Cookie{}
	logonCookie.Path = "/"
	logonCookie.HttpOnly = true
	http.SetCookie(w, logonCookie)
	w.WriteHeader(200)
}
