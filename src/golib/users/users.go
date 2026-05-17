package users

import (
	"catears/ffs/lib/security"
	"errors"
)

// A user with name `Username` and access to `Claims`
type UserRecord struct {
	Username string
	Claims   []*security.Claim
}

// A `UserRecordSource` can match and check users against a given username and password
type UserRecordSource interface {
	Configure() error
	MatchUser(username, password string) *UserRecord
	Name() string
}

// A `UserManager` keeps track of UserRecordSources and delegates username and password checks to them.
type UserManager struct {
	initialSources []UserRecordSource
	sources        []UserRecordSource
}

// Create a new user manager with the provided sources.
//
// In order to be valid, the user manager must be `Configure()`d.
func NewUserManager(sourceOne UserRecordSource, restSources ...UserRecordSource) *UserManager {
	return &UserManager{
		initialSources: append([]UserRecordSource{sourceOne}, restSources...),
		sources:        []UserRecordSource{},
	}
}

// Attempts to match a user with the given password against a user record.
// returns `nil` both on mismatch and password fail.
func (mgr *UserManager) MatchUser(username, password string) *UserRecord {
	for _, source := range mgr.sources {
		if user := source.MatchUser(username, password); user != nil {
			return user
		}
	}
	return nil
}

// Call to initialize and configure all user record sources.
//
// This function must be called once (and only once) before any user can be matched.
func (mgr *UserManager) Configure() error {
	errs := []error{}
	for _, source := range mgr.initialSources {
		err := source.Configure()
		errs = append(errs, err)
		if err == nil {
			mgr.sources = append(mgr.sources, source)
		}
	}

	return errors.Join(errs...)
}
