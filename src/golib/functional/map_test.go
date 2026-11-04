package functional

import (
	"catears/ffs/lib/assert"
	"fmt"
	"testing"
)

func TestMap(t *testing.T) {
	seq := []int{
		1, 2, 3,
	}
	res := Map(func(x int) string { return fmt.Sprint(x) }, seq)
	assert.Equal(t, len(res), 3)
	assert.Equal(t, res[0], "1")
	assert.Equal(t, res[1], "2")
	assert.Equal(t, res[2], "3")
}
