package response

import (
	"catears/ffs/lib/assert"
	"testing"
	"time"
)

func TestCookieWriterSetsCookieCorrectly(t *testing.T) {
	cw := NewCookieWriter()
	cw.WithHttpOnly()
	timestamp, _ := time.Parse(time.RFC1123, "Tue, 29 Oct 2024 16:56:32 GMT")
	cw.WithExpiration(timestamp)
	cw.WithKeyValue("X-Test-Cookie", "TestVal")
	cw.WithSecure()
	cw.WithPath("/docs")
	cw.WithSameSite(Lax)
	cw.WithDomain("test.com")
	cw.WithMaxAge(time.Second * 50)
	name, val := cw.buildHeader()
	assert.Equal(t, name, "Set-Cookie")
	assert.Equal(t, val, "X-Test-Cookie=TestVal; HttpOnly; Expires=Tue, 29 Oct 2024 16:56:32 GMT; Secure; Path=/docs; SameSite=Lax; Domain=test.com; Max-Age=50")
}

func TestMaxAgeIsTruncatingTimeToSecondsCorrectly(t *testing.T) {
	cw := NewCookieWriter()
	cw.WithKeyValue("X-Test-Cookie", "TestVal")
	cw.WithMaxAge(time.Millisecond * 5500)
	name, val := cw.buildHeader()
	assert.Equal(t, name, "Set-Cookie")
	assert.Equal(t, val, "X-Test-Cookie=TestVal; Max-Age=5")
}
