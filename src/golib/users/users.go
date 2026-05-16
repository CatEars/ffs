package users

import (
	"catears/ffs/lib/security"
	"errors"
)

var userResourceManager = security.NewResourceManager("user")

type UserRecord struct {
	Username string
	Claims   []*security.Claim
}

type UserRecordSource interface {
	Configure() error
	MatchUser(username, password string) *UserRecord
	Name() string
}

type UserManager struct {
	initialSources []UserRecordSource
	sources        []UserRecordSource
}

func NewUserManager(sources []UserRecordSource) *UserManager {
	return &UserManager{
		initialSources: sources,
		sources:        []UserRecordSource{},
	}
}

func (mgr *UserManager) MatchUser(username, password string) *UserRecord {
	for _, source := range mgr.sources {
		if user := source.MatchUser(username, password); user != nil {
			return user
		}
	}
	return nil
}

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
