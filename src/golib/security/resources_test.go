package security

import (
	"catears/ffs/lib/assert"
	"encoding/json"
	"testing"
)

var mgr *ResourceManager = NewResourceManager("User")

func TestGetPlainId(t *testing.T) {
	assert.Equal(t, mgr.GetId("123").String(), "ffs-resource://ffs/User/123")
}

func TestGetHierarchicalResourceId(t *testing.T) {
	expected := "ffs-resource://ffs/User/Avatar/ThumbnailUrl/123"
	actual := mgr.GetId("Avatar", "ThumbnailUrl", "123").String()
	assert.Equal(t, actual, expected)
}

func TestSlashesDoNotIntroduceSubhierarchyAccidentally(t *testing.T) {
	expected := `ffs-resource://ffs/User/Name/name%252Fwith.dots.and%252Fslashes`
	actual := mgr.GetId("Name", "name/with.dots.and/slashes").String()
	assert.Equal(t, actual, expected)
}

func TestWriteBasedClaimIsAddedToString(t *testing.T) {
	expected := `ffs-resource://ffs/User/Avatar#Write`
	actual := mgr.GetClaim(StandardAccess.Write(), "Avatar").String()
	assert.Equal(t, actual, expected)
}

func TestReadBaseClaimdIsAddedToString(t *testing.T) {
	expected := `ffs-resource://ffs/User/Avatar#Read`
	actual := mgr.GetClaim(StandardAccess.Read(), "Avatar").String()
	assert.Equal(t, actual, expected)
}

func TestExactClaimMatchHasAccess(t *testing.T) {
	a := mgr.GetClaim(StandardAccess.Read(), "User")
	b := mgr.GetClaim(StandardAccess.Read(), "User")
	assert.True(t, mgr.HasAccess(b, a))
	assert.True(t, mgr.HasAccess(a, b))
}

func TestPrefixMatchHasClaim(t *testing.T) {
	a := mgr.GetClaim(StandardAccess.Read(), "User")
	b := mgr.GetClaim(StandardAccess.Read(), "User", "123")
	assert.True(t, mgr.HasAccess(b, a))
}

func TestMismatchedPrefixHasNoClaim(t *testing.T) {
	a := mgr.GetClaim(StandardAccess.Read(), "User", "123")
	b := mgr.GetClaim(StandardAccess.Read(), "User")
	assert.False(t, mgr.HasAccess(b, a))
}

func TestWriteAccessWithMatchingPrefixImpliesReadAccess(t *testing.T) {
	a := mgr.GetClaim(StandardAccess.Write(), "User")
	b := mgr.GetClaim(StandardAccess.Read(), "User", "123")
	assert.True(t, mgr.HasAccess(b, a))
}

func TestReadAccessWithMatchingPrefixDoesNotImplyWriteAccess(t *testing.T) {
	a := mgr.GetClaim(StandardAccess.Read(), "User")
	b := mgr.GetClaim(StandardAccess.Write(), "User", "123")
	assert.False(t, mgr.HasAccess(b, a))
}

func TestResourceManagerCanBeCreatedWithOwnVerifier(t *testing.T) {
	newMgr := NewResourceManagerWithVerifier("xkcd", &ClaimVerifier{
		HasAccessFunc: func(requestedClaim, principalClaim *Claim) bool {
			if principalClaim.Access == "Shibboleet" {
				return true
			} else {
				return DefaultClaimVerificationFunc(principalClaim, requestedClaim)
			}
		},
	})
	a := newMgr.GetClaim("Shibboleet", "comic", "number", "806")
	b := newMgr.GetClaim(StandardAccess.Read(), "it", "you", "should")
	assert.True(t, newMgr.HasAccess(b, a))
}

func TestRootAccessGivesAccess(t *testing.T) {
	rootAccess := mgr.GetClaim(StandardAccess.Write())
	someResource := mgr.GetClaim(StandardAccess.Read(), "Email", "123")
	assert.True(t, mgr.HasAccess(someResource, rootAccess))
}

func TestMarshalClaimAsText(t *testing.T) {
	claim := mgr.GetClaim(StandardAccess.Write(), "Phone", "123")
	asJson, err := json.Marshal(claim)
	assert.Nil(t, err)
	assert.Equal(t, string(asJson), `"ffs-resource://ffs/User/Phone/123#Write"`)
}

func TestUnmarshalClaimAsText(t *testing.T) {
	// note the extra `"` to indicate string type
	jsonEncodedClaim := `"ffs-resource://ffs/User/Phone/123#Write"`
	claim := &Claim{}
	err := json.Unmarshal([]byte(jsonEncodedClaim), claim)
	assert.Nil(t, err)
	assert.Equal(t, claim, mgr.GetClaim(StandardAccess.Write(), "Phone", "123"))
}
