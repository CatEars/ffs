package response

import (
	"fmt"
	"net/http"
	"strings"
	"time"
)

type SameSiteSetting int

const (
	Strict SameSiteSetting = iota
	Lax
	None
)

type CookieWriter struct {
	key    string
	value  string
	extras []string
}

func NewCookieWriter() *CookieWriter {
	return &CookieWriter{}
}

func (cw *CookieWriter) WithHttpOnly() {
	cw.extras = append(cw.extras, "HttpOnly")
}

func (cw *CookieWriter) WithKeyValue(key, value string) {
	cw.key = key
	cw.value = value
}

func (cw *CookieWriter) WithSecure() {
	cw.extras = append(cw.extras, "Secure")
}

func (cw *CookieWriter) WithExpiration(t time.Time) {
	// go uses UTC
	timestamp := strings.Replace(t.UTC().Format(time.RFC1123), "UTC", "GMT", 1)
	cw.extras = append(cw.extras, fmt.Sprintf("Expires=%s", timestamp))
}

func (cw *CookieWriter) WithMaxAge(duration time.Duration) {
	cw.extras = append(cw.extras, fmt.Sprintf("Max-Age=%d", int(duration.Seconds())))
}

func (cw *CookieWriter) WithPath(path string) {
	cw.extras = append(cw.extras, fmt.Sprintf("Path=%s", path))
}

func (cw *CookieWriter) WithSameSite(sss SameSiteSetting) {
	if sss == Strict {
		cw.extras = append(cw.extras, "SameSite=Strict")
	} else if sss == Lax {
		cw.extras = append(cw.extras, "SameSite=Lax")
	} else if sss == None {
		cw.extras = append(cw.extras, "SameSite=None")
	}
}

func (cw *CookieWriter) WithDomain(domain string) {
	cw.extras = append(cw.extras, fmt.Sprintf("Domain=%s", domain))
}

func (cw *CookieWriter) buildExtras() string {
	if len(cw.extras) == 0 {
		return ""
	} else {
		return fmt.Sprintf("; %s", strings.Join(cw.extras, "; "))
	}
}

func (cw *CookieWriter) buildHeader() (string, string) {
	return "Set-Cookie", fmt.Sprintf("%s=%s%s", cw.key, cw.value, cw.buildExtras())
}

func (cw *CookieWriter) WriteCookie(writer http.ResponseWriter) {
	key, value := cw.buildHeader()
	writer.Header().Add(key, value)
}
