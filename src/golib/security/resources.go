package security

import (
	"net/url"
	"strings"
)

// Unique identification of a resource
type ResourceId url.URL

// Converts the ResourceID to its string representation
func (resId *ResourceId) String() string {
	return (*url.URL)(resId).String()
}

// Manager for a particular type of resource, e.g. User, or File
type ResourceManager struct {
	ResourceName string
}

// Creates a new resource manager, used to generate Ids and check permissions for that resource
func NewResourceManager(resourceName string) *ResourceManager {
	return &ResourceManager{
		ResourceName: url.PathEscape(resourceName),
	}
}

// Returns the ID of the resource defined by the hierarchy of identifiers
// Example:
//
//	ResourceManager{"User"}.GetId("123")
//	>> Resource ID for user with ID "123"
//
//	ResourceManager{"File"}.GetId("Thumbnail", "/movies/mymovie.mp4")
//	>> Resource ID for subgroup thumbnail of "mymovie.mp4"
func (mgr *ResourceManager) GetId(hierarchy ...string) *ResourceId {
	paths := make([]string, len(hierarchy)+1)
	paths[0] = mgr.ResourceName
	for id, el := range hierarchy {
		paths[id+1] = url.PathEscape(el)
	}
	return &ResourceId{
		Scheme: "ffs-resource",
		Host:   "global",
		Path:   "/" + strings.Join(paths, "/"),
	}
}
