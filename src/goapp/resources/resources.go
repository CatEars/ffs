package resources

import "catears/ffs/lib/security"

var UserResource = security.NewResourceManager("user")
var AdminResource = security.NewResourceManager("admin")

var CreateUserClaim = AdminResource.GetClaim(security.StandardAccess.Write(), "CreateUser")
var HousekeepingClaim = AdminResource.GetClaim(security.StandardAccess.Write(), "Housekeeping")
