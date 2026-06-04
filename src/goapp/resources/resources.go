package resources

import "catears/ffs/lib/security"

var AdminResource = security.NewResourceManager("Admin")
var CreateUserClaim = AdminResource.GetClaim(security.StandardAccess.Write(), "CreateUser")
var HousekeepingClaim = AdminResource.GetClaim(security.StandardAccess.Write(), "Housekeeping")

var AppTabsResources = security.NewResourceManager("AppTabs")
var CanSeeAdminTabClaim = AppTabsResources.GetClaim(security.StandardAccess.Read(), "Admin")
var CanSeeHomeTabClaim = AppTabsResources.GetClaim(security.StandardAccess.Read(), "Home")
var CanSeeLogsTabClaim = AppTabsResources.GetClaim(security.StandardAccess.Read(), "Logs")
var CanSeeShareTabClaim = AppTabsResources.GetClaim(security.StandardAccess.Read(), "Share")
var CanSeeCustomCommandsTabClaim = AppTabsResources.GetClaim(security.StandardAccess.Read(), "CustomCommands")

var UserResource = security.NewResourceManager("User")
