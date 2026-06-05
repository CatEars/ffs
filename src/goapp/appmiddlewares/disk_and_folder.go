package appmiddlewares

import (
	"catears/ffs/goapp/disks"
	"catears/ffs/goapp/resources"
	"catears/ffs/lib/middlewares"
	"catears/ffs/lib/router"
	"catears/ffs/lib/security"
	"context"
	"errors"
	"fmt"
	"net/http"
	"path/filepath"
	"strconv"
	"strings"
)

type diskAndFolderKey string

func GetDiskAndFolderKey() diskAndFolderKey {
	return diskAndFolderKey("diskandfolderkey")
}

func GetDiskAndFolderFromRequest(r *http.Request) (*disks.DiskAndFolder, error) {
	val := r.Context().Value(GetDiskAndFolderKey())
	if val == nil {
		return nil, errors.New("No disk and folder set in request")
	}

	v, ok := val.(*disks.DiskAndFolder)
	if !ok {
		return nil, fmt.Errorf("Failed to cast %s to DiskAndFolder", val)
	}
	return v, nil
}

func diskIndexFromRequest(r *http.Request) int {
	diskStr := r.URL.Query().Get("disk")
	res, err := strconv.Atoi(diskStr)
	if err != nil {
		return 0
	} else {
		return res
	}
}

func RequireDiskAndFolder(accessLevel security.AccessLevel) router.Middleware {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			diskIdx := diskIndexFromRequest(r)
			path := r.URL.Query().Get("folder")
			if path == "" {
				path = "."
			}
			path = strings.TrimPrefix(path, "./")

			elems := strings.Split(filepath.Clean(path), string(filepath.Separator))
			hierarchy := []string{strconv.Itoa(diskIdx)}
			hierarchy = append(hierarchy, elems...)

			claims := middlewares.LookupClaims(r)
			diskClaim := resources.DiskResources.GetClaim(security.StandardAccess.Write(), hierarchy...)
			if !resources.DiskResources.AnyHasAccess(diskClaim, claims...) {
				w.WriteHeader(http.StatusForbidden)
				return
			}

			diskAndFolder := &disks.DiskAndFolder{
				DiskIdx: diskIdx,
				Path:    path,
			}
			ctx := context.WithValue(r.Context(), GetDiskAndFolderKey(), diskAndFolder)
			next.ServeHTTP(w, r.WithContext(ctx))
		})
	}
}
