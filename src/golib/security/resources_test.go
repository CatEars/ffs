package security

import (
	"catears/ffs/lib/assert"
	"testing"
)

var mgr *ResourceManager = NewResourceManager("User")

func TestGetPlainId(t *testing.T) {
	assert.Equal(t, mgr.GetId("123").String(), "ffs-resource://global/User/123")
}

func TestGetHierarchicalResourceId(t *testing.T) {
	expected := "ffs-resource://global/User/Avatar/ThumbnailUrl/123"
	actual := mgr.GetId("Avatar", "ThumbnailUrl", "123").String()
	assert.Equal(t, actual, expected)
}

func TestSlashesDoNotIntroduceSubhierarchyAccidentally(t *testing.T) {
	expected := `ffs-resource://global/User/Name/name%252Fwith.dots.and%252Fslashes`
	actual := mgr.GetId("Name", "name/with.dots.and/slashes").String()
	assert.Equal(t, actual, expected)
}
