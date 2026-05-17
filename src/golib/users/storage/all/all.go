package all

import (
	"catears/ffs/lib/security"
	"catears/ffs/lib/users"
	"errors"
)

// `AllUserSource` lets through all users as root
//
// ONLY use this in development mode!
type AllUserSource struct {
	skipConfigure bool
}

// Create `AllUserSource` that lets all users through as root
func New(skipConfigure bool) AllUserSource {
	return AllUserSource{
		skipConfigure: skipConfigure,
	}
}

func (all *AllUserSource) Configure() error {
	if all.skipConfigure {
		return errors.New("AllUserSource skipped")
	}
	return nil
}

func (all *AllUserSource) MatchUser(username, password string) *users.UserRecord {
	return &users.UserRecord{
		Username: username,
		Claims: []*security.Claim{
			&security.RootClaim,
		},
	}
}

func (all *AllUserSource) Name() string {
	return "Accept Everyone as Root - Source"
}
