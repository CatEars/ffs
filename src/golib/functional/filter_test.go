package functional

import (
	"catears/ffs/lib/assert"
	"strings"
	"testing"
)

func isUpper(s string) bool {
	return strings.ToUpper(s) == s
}

func isTwoOrMore(x int) bool {
	return x >= 2
}

func TestFilterForStrings(t *testing.T) {
	seq := []string{
		"a",
		"b",
		"A",
		"B",
	}
	res := Filter(isUpper, seq)
	assert.Equal(t, len(res), 2)
	assert.Equal(t, res[0], "A")
	assert.Equal(t, res[1], "B")
}

func TestFilterForInts(t *testing.T) {
	seq := []int{
		1,
		2,
		3,
		4,
	}

	res := Filter(isTwoOrMore, seq)
	assert.Equal(t, len(res), 3)
	assert.Equal(t, res[0], 2)
	assert.Equal(t, res[1], 3)
	assert.Equal(t, res[2], 4)
}

type functor struct {
}

func (functor) IsThree(x int) bool {
	return x == 3
}

func (*functor) IsFour(x int) bool {
	return x == 4
}

func TestCanUseStructOwnedFunction(t *testing.T) {
	seq := []int{
		2, 3, 4,
	}
	f := functor{}
	res := Filter(f.IsThree, seq)
	assert.Equal(t, len(res), 1)
	assert.Equal(t, res[0], 3)

	res = Filter(f.IsFour, seq)
	assert.Equal(t, len(res), 1)
	assert.Equal(t, res[0], 4)
}
