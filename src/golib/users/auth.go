package users

// TODO: This permission structure exists in-situ of us moving to claims for everything
type UserPermissions struct {
	AllowHousekeeping bool `json:"allowHousekeeping,omitempty"`
	CanCreateNewUsers bool `json:"canCreateNewUsers,omitempty"`
}
