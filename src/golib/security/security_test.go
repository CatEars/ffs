package security

import "testing"

func TestIsThisSecure(t *testing.T) {
	if !IsSecure() {
		t.Fail()
	}
}
