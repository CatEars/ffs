package all

import (
	"catears/ffs/lib/assert"
	"catears/ffs/lib/security"
	"catears/ffs/lib/users"
	"testing"
)

func TestUserManagerCanDelegateToGivenUserRecordSource(t *testing.T) {
	man := users.NewUserManager(&AllUserSource{})
	err := man.Configure()
	assert.Nil(t, err)
	usr := man.MatchUser("this-matches-everything", "test123")
	assert.NotNil(t, usr)
	assert.Equal(t, usr.Username, "this-matches-everything")
	assert.Equal(t, usr.Claims[0], &security.RootClaim)
}
