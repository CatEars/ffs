package router

import (
	"net/http"
	"net/url"
)

type SearchParam struct {
	key   string
	value string
}

func Param(key, value string) SearchParam {
	return SearchParam{
		key:   key,
		value: value,
	}
}

// Returns the sender to where they came from with the help of `Referer` header. If not set, default to `/`.
//
// Optional search params may be added with `Param(key, value)`
func ReturnToSender(w http.ResponseWriter, r *http.Request, searchParams ...SearchParam) {
	referer := r.Header.Get("Referer")
	parsed, err := url.Parse(referer)
	if err != nil {
		parsed.Path = "/"
	}
	redirectUrl := url.URL{}
	redirectUrl.Path = parsed.Path

	vals := parsed.Query()
	for _, p := range searchParams {
		vals.Add(p.key, p.value)
	}
	redirectUrl.RawQuery = vals.Encode()
	http.Redirect(w, r, redirectUrl.String(), http.StatusFound)
}
