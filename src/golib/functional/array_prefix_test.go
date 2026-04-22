package functional

import (
	"catears/ffs/lib/assert"
	"testing"
)

func TestEmptyArrayIsPrefixToAllOtherArrays(t *testing.T) {
	assert.True(t, IsArrayPrefix([]string{}, []string{}))
	assert.True(t, IsArrayPrefix([]string{}, []string{"a"}))
	assert.True(t, IsArrayPrefix([]string{}, []string{"b"}))
	assert.True(t, IsArrayPrefix([]string{}, []string{"c", "d", "e", "f"}))
}

func TestOnePrefixElementWithLongerCheckedIsCountedAsPrefix(t *testing.T) {
	assert.True(t, IsArrayPrefix([]string{"test"}, []string{"test", "a", "b", "c"}),
		"Prefix with single element matches")
}

func TestMismatchingPrefixIsNotCountedAsPrefix(t *testing.T) {
	assert.False(t, IsArrayPrefix([]string{"not-matching"}, []string{"test"}), "Single prefix with mismatch")
	assert.False(t, IsArrayPrefix([]string{"not-matching"}, []string{}), "Single prefix against empty array")
}

func TestExactlyMatchingPrefixIsPrefix(t *testing.T) {
	assert.True(t, IsArrayPrefix([]string{"a", "b", "c"}, []string{"a", "b", "c"}), "Exactly matches")
}
