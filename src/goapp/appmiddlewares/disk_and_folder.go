package appmiddlewares

import (
	"catears/ffs/goapp/disks"
	"catears/ffs/goapp/resources"
	libdisks "catears/ffs/lib/disks"
	"catears/ffs/lib/middlewares"
	"catears/ffs/lib/router"
	"catears/ffs/lib/security"
	"context"
	"errors"
	"fmt"
	"net/http"
)

type diskContextKey string

const diskContextKeyConstant diskContextKey = diskContextKey("diskandfolderkey")

func GetDiskFromRequest(r *http.Request) (libdisks.Disk, error) {
	val := r.Context().Value(diskContextKeyConstant)
	if val == nil {
		return nil, errors.New("No disk and folder set in request")
	}

	v, ok := val.(libdisks.Disk)
	if !ok {
		return nil, fmt.Errorf("Failed to cast %s to DiskAndFolder", val)
	}
	return v, nil
}

func DiskIdFromRequest(r *http.Request) string {
	return r.URL.Query().Get("disk")
}

// TODO: Change this name, folder is not required, only disk
func RequireDiskAndFolder(accessLevel security.AccessLevel) router.Middleware {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			diskId := DiskIdFromRequest(r)
			// TODO: Lets use a default disk and have the middleware select it here.
			claims := middlewares.LookupClaims(r)
			diskClaim := resources.DiskResources.GetClaim(security.StandardAccess.Write(), diskId)
			if !resources.DiskResources.AnyHasAccess(diskClaim, claims...) {
				w.WriteHeader(http.StatusForbidden)
				return
			}
			disk := disks.DiskStore.DiskOrDefault(diskId)

			ctx := context.WithValue(r.Context(), diskContextKeyConstant, disk)
			next.ServeHTTP(w, r.WithContext(ctx))
		})
	}
}
