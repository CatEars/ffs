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

func TestWriteBasedClaimIsAddedToString(t *testing.T) {
	expected := `ffs-resource://global/User/Avatar#Write`
	actual := mgr.GetClaim(StandardAccess.Write(), "Avatar").String()
	assert.Equal(t, actual, expected)
}

func TestReadBaseClaimdIsAddedToString(t *testing.T) {
	expected := `ffs-resource://global/User/Avatar#Read`
	actual := mgr.GetClaim(StandardAccess.Read(), "Avatar").String()
	assert.Equal(t, actual, expected)
}

func TestExactClaimMatchHasAccess(t *testing.T) {
	a := mgr.GetClaim(StandardAccess.Read(), "User")
	b := mgr.GetClaim(StandardAccess.Read(), "User")
	assert.True(t, mgr.HasAccess(a, b))
	assert.True(t, mgr.HasAccess(b, a))
}

func TestPrefixMatchHasClaim(t *testing.T) {
	a := mgr.GetClaim(StandardAccess.Read(), "User")
	b := mgr.GetClaim(StandardAccess.Read(), "User", "123")
	assert.True(t, mgr.HasAccess(a, b))
}

func TestMismatchedPrefixHasNoClaim(t *testing.T) {
	a := mgr.GetClaim(StandardAccess.Read(), "User", "123")
	b := mgr.GetClaim(StandardAccess.Read(), "User")
	assert.False(t, mgr.HasAccess(a, b))
}

func TestWriteAccessWithMatchingPrefixImpliesReadAccess(t *testing.T) {
	a := mgr.GetClaim(StandardAccess.Write(), "User")
	b := mgr.GetClaim(StandardAccess.Read(), "User", "123")
	assert.True(t, mgr.HasAccess(a, b))
}

func TestReadAccessWithMatchingPrefixDoesNotImplyWriteAccess(t *testing.T) {
	a := mgr.GetClaim(StandardAccess.Read(), "User")
	b := mgr.GetClaim(StandardAccess.Write(), "User", "123")
	assert.False(t, mgr.HasAccess(a, b))
}

func TestResourceManagerCanBeCreatedWithOwnVerifier(t *testing.T) {
	newMgr := NewResourceManagerWithVerifier("xkcd", &ClaimVerifier{
		HasAccessFunc: func(principalClaims, requestedClaims *Claim) bool {
			if principalClaims.Access == "Shibboleet" {
				return true
			} else {
				return defaultClaimVerificationFunc(principalClaims, requestedClaims)
			}
		},
	})
	a := newMgr.GetClaim("Shibboleet", "comic", "number", "806")
	b := newMgr.GetClaim(StandardAccess.Read(), "it", "you", "should")
	assert.True(t, newMgr.HasAccess(a, b))
}
