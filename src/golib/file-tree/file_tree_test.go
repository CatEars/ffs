package filetree

import (
	"catears/ffs/lib/assert"
	"testing"
)

func check(t *testing.T, expectedResult, root, path string, extraPaths ...string) {
	ft := New(root)
	file := ft.Traverse(path, extraPaths...)
	assert.Equal(t, file.Path, expectedResult)
}

func checkInvalid(t *testing.T, root, path string, extraPaths ...string) {
	ft := New(root)
	file := ft.Traverse(path, extraPaths...)
	assert.Equal(t, file, Invalid)
}

func TestBasicSubpathResolvesCorrectly(t *testing.T) {
	check(t, "/etc/passwd", "/", "etc/passwd")
}

func TestBasicMultipathResolvesCorrectly(t *testing.T) {
	check(t, "/etc/passwd", "/", "etc", "passwd")
}

func TestPathTraversalAttack(t *testing.T) {
	checkInvalid(t, "/tmp", "..", "etc", "passwd")
	checkInvalid(t, "/tmp", "../etc/passwd")
	checkInvalid(t, "/tmp/fun", "../fun-prefixed-file.ts")
}
