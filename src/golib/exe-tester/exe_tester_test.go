package exetester

import (
	"catears/ffs/lib/assert"
	"regexp"
	"testing"
)

func checkEcho(t *testing.T, regex string, echoArgs ...string) bool {
	tester := New("echo", echoArgs, *regexp.MustCompile(regex))
	exists, err := tester.Exists()
	assert.Nil(t, err)
	return exists
}

func TestReturnsTrueWhenMatchMatchesOutput(t *testing.T) {
	assert.True(t, checkEcho(t, `fish`, "so", "long", "and", "thanks", "for", "all", "the", "fish"))
}

func TestReturnsFalseWhenDoesNotMatchOutput(t *testing.T) {
	assert.False(t, checkEcho(t, `dolphin`, "so", "long", "and", "thanks", "for", "all", "the", "fish"))
}

func TestRaisesErrorWhenExecutableDoesNotExist(t *testing.T) {
	tester := New("echo-but-not-really", []string{"test"}, *regexp.MustCompile(`fish`))
	_, err := tester.Exists()
	assert.NotNil(t, err)
	assert.Contains(t, err.Error(), "executable file not found in $PATH")
}
