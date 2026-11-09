package safefs

import (
	"catears/ffs/lib/assert"
	"testing"
)

func TestDirExists(t *testing.T) {
	assert.True(t, DirExists("/"))
	assert.False(t, DirExists("/does-not-exist"))
}
