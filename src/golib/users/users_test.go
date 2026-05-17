package users

import (
	"catears/ffs/lib/assert"
	"catears/ffs/lib/security"
	"encoding/json"
	"testing"
)

func TestCanMarshallUserToJson(t *testing.T) {
	testResourceManager := security.NewResourceManager("Test")
	usr := &UserRecord{
		Username: "testname",
		Claims: []*security.Claim{
			testResourceManager.GetClaim(security.StandardAccess.Write(), "123"),
			testResourceManager.GetClaim(security.StandardAccess.Write(), "456"),
			testResourceManager.GetClaim(security.StandardAccess.Read(), "789"),
		},
	}
	encoded, err := json.Marshal(usr)
	assert.Nil(t, err)
	assert.Equal(t, string(encoded), `{"Username":"testname","Claims":["ffs-resource://ffs/Test/123#Write","ffs-resource://ffs/Test/456#Write","ffs-resource://ffs/Test/789#Read"]}`)
}
