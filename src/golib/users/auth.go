package users

import "catears/ffs/lib/security"

// TODO: This permission structure exists in-situ of us moving to claims for everything
type UserPermissions struct {
	AllowHousekeeping bool `json:"allowHousekeeping,omitempty"`
	CanCreateNewUsers bool `json:"canCreateNewUsers,omitempty"`
}

var adminResourceManager = security.NewResourceManager("Admin")
var adminWriteClaim = adminResourceManager.GetClaim(security.StandardAccess.Write())

func UserMayHousekeep(user *UserRecord) bool {
	return adminResourceManager.AnyHasAccess(adminWriteClaim, user.Claims...)
}

func UserMayCreateNewUsers(user *UserRecord) bool {
	return adminResourceManager.AnyHasAccess(adminWriteClaim, user.Claims...)
}
