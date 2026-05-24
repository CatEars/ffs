package security

import (
	"catears/ffs/lib/functional"
	"encoding/json"
	"errors"
	"net/url"
	"strings"
)

var ffsResourceScheme string = "ffs-resource"
var ffsResourceDomain string = "ffs"

// AccessLevel determines how a principal may access a particular resource
// AccessLevel is combined with a resource to produce a specific claim
//
// The access level is a free text string so that non-library code can define
// its own security policies based on it. However, there are standard access
// levels like:
//
//   - StandardAccess.Write()
//   - StandardAccess.Read()
//
// Write implies Read
type AccessLevel string

// Converts an AccessLevel to a string
func (al *AccessLevel) String() string {
	return string(*al)
}

type standardLevelNames struct {
}

// Standard name for write access
func (*standardLevelNames) Write() AccessLevel {
	return "Write"
}

// Standard name for read access
func (*standardLevelNames) Read() AccessLevel {
	return "Read"
}

// Contains standard access levels like Read() and Write()
var StandardAccess = &standardLevelNames{}

// Unique identification of a resource
// Resources are hierarchical. That is, a principal that has access to write
// `/User` resource also has access to `/User/123`
type ResourceId url.URL

func (resId *ResourceId) hierarchy() []string {
	if resId == nil {
		return []string{}
	}
	return strings.Split(resId.Path, "/")
}

// Converts the ResourceID to its string representation
func (resId *ResourceId) String() string {
	if resId == nil {
		return ""
	}
	return (*url.URL)(resId).String()
}

// Returns true if `lhs` is a prefix of `rhs`. Any AccessLevel
// applied to `lhs` is then inherited by `rhs`
func (lhs *ResourceId) IsPrefixFor(rhs *ResourceId) bool {
	if lhs == nil || rhs == nil {
		return false
	}
	lhsHierarchy := lhs.hierarchy()
	rhsHierarchy := rhs.hierarchy()
	return functional.IsArrayPrefix(lhsHierarchy, rhsHierarchy)
}

// Claim combines a ResourceId and the AccessLevel to define how a resource
// can be accessed by the particular principal
type Claim struct {
	Resource *ResourceId
	Access   AccessLevel
}

// Converts a claim to a string representation
func (claim *Claim) String() string {
	return claim.Resource.String() + "#" + string(claim.Access)
}

func (claim *Claim) LegacyString() string {
	paths := strings.Split(claim.Resource.Path, "/")
	for idx, v := range paths {
		paths[idx], _ = url.PathUnescape(v)
	}
	if len(paths) > 0 && paths[0] == "" {
		paths = paths[1:]
	}
	res, _ := json.Marshal(paths)
	return string(res)
}

func (claim *Claim) MarshalBinary() (data []byte, err error) {
	if claim == nil {
		return []byte{}, errors.New("Unable to marshall `nil` Claim")
	}

	s := claim.String()
	return []byte(s), nil
}

func (claim *Claim) UnmarshalBinary(data []byte) error {
	s := string(data)
	parsed, err := url.Parse(s)
	if err != nil {
		return err
	}

	claim.Access = AccessLevel(parsed.Fragment)
	claim.Resource = &ResourceId{}
	claim.Resource.Scheme = ffsResourceScheme
	claim.Resource.Host = ffsResourceDomain
	claim.Resource.Path = parsed.Path
	return nil
}

func (claim *Claim) MarshalText() (text []byte, err error) {
	return claim.MarshalBinary()
}

func (claim *Claim) UnmarshalText(text []byte) error {
	return claim.UnmarshalBinary(text)
}

func (lhs *Claim) Equal(rhs *Claim) bool {
	return lhs.Access == rhs.Access && lhs.Resource.Path == rhs.Resource.Path
}

// Function to verify a principal has the correct access to a requested claim
type ClaimVerificationFunction = func(requestedClaim, principalClaim *Claim) bool

func DefaultClaimVerificationFunc(requestedClaim, principalClaim *Claim) bool {
	if principalClaim == nil || requestedClaim == nil {
		return false
	}

	prefixes := principalClaim.Resource.IsPrefixFor(requestedClaim.Resource)
	if !prefixes {
		return false
	}

	sameAccess := principalClaim.Access == requestedClaim.Access
	if sameAccess {
		return true
	}

	// Write access implies read access
	return (principalClaim.Access == StandardAccess.Write() && requestedClaim.Access == StandardAccess.Read())
}

// A claim verifier is used to check if one claim gives access to another
//
// You only need to use this if you override verification via `NewResourceManagerWithVerifier`
type ClaimVerifier struct {
	HasAccessFunc ClaimVerificationFunction
}

// Uses the default verification function (write -> read) to ensure
var verifier *ClaimVerifier = &ClaimVerifier{
	HasAccessFunc: DefaultClaimVerificationFunc,
}

// Manager for a particular type of resource, e.g. User, or File
type ResourceManager struct {
	ResourceName string
	Verifier     *ClaimVerifier
}

// Creates a new resource manager, used to generate Ids and check permissions for that resource
func NewResourceManager(resourceName string) *ResourceManager {
	return &ResourceManager{
		ResourceName: url.PathEscape(resourceName),
		Verifier:     verifier,
	}
}

func NewResourceManagerWithVerifier(resourceName string, verifier *ClaimVerifier) *ResourceManager {
	return &ResourceManager{
		ResourceName: url.PathEscape(resourceName),
		Verifier:     verifier,
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
	if mgr == nil {
		return nil
	}
	paths := make([]string, len(hierarchy)+1)
	paths[0] = mgr.ResourceName
	for id, el := range hierarchy {
		paths[id+1] = url.PathEscape(el)
	}
	return &ResourceId{
		Scheme: ffsResourceScheme,
		Host:   ffsResourceDomain,
		Path:   "/" + strings.Join(paths, "/"),
	}
}

// Returns a matching claim defined by the hierarchy of identifiers
// Example:
//
//	ResourceManager{"User"}.GetClaim(StandardAccess.Write(), "Avatar", "123")
//	>> Write (and read) access to "Avatar" subgroup of "User" resource
func (mgr *ResourceManager) GetClaim(accessLevel AccessLevel, hierarchy ...string) *Claim {
	if mgr == nil {
		return nil
	}
	return &Claim{
		Resource: mgr.GetId(hierarchy...),
		Access:   accessLevel,
	}
}

// Checks if the principal claims has access to the requestd claim
func (mgr *ResourceManager) HasAccess(requestedClaim, principalClaim *Claim) bool {
	if mgr == nil || principalClaim == nil || requestedClaim == nil {
		return false
	}

	return mgr.Verifier.HasAccessFunc(requestedClaim, principalClaim)
}

func (mgr *ResourceManager) AnyHasAccess(requestedClaim *Claim, claims ...*Claim) bool {
	for _, claim := range claims {
		if mgr.HasAccess(claim, requestedClaim) {
			return true
		}
	}
	return false
}

// `RootClaim` is a claim that gives full access to the `ffs` domain
var RootClaim Claim = Claim{
	Resource: &ResourceId{
		Scheme: ffsResourceScheme,
		Host:   ffsResourceDomain,
		Path:   "/",
	},
	Access: StandardAccess.Write(),
}
