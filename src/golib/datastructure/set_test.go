package datastructure

import (
	"catears/ffs/lib/assert"
	"testing"
)

func TestSet(t *testing.T) {
	s := NewSet()
	s.Add("testvalue")

	assert.True(t, s.Has("testvalue"))
	assert.False(t, s.Has("not-test-value"))
}

func TestSetAddSlice(t *testing.T) {
	s := NewSet()
	s.AddSlice([]string{"testvalue", "testvalue2"})

	assert.True(t, s.Has("testvalue"))
	assert.True(t, s.Has("testvalue2"))
	assert.False(t, s.Has("not-test-value"))
}
