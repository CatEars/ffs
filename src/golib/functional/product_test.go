package functional

import (
	"catears/ffs/lib/assert"
	"testing"
)

func TestProduct(t *testing.T) {
	lhs := []string{"a", "b", "c"}
	rhs := []string{"1", "2", "3"}
	sum := Product(lhs, rhs, Sum.String)
	result := []string{"a1", "a2", "a3", "b1", "b2", "b3", "c1", "c2", "c3"}
	assert.SequenceEqual(t, sum, result)
}
