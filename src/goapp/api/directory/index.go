package directory

import (
	approutes "catears/ffs/goapp/app-routes"
	"catears/ffs/goapp/appmiddlewares"
	"catears/ffs/lib/router"
	"catears/ffs/lib/security"
	"fmt"
	"io/fs"
	"net/http"
	"net/url"
	"path"
	"strings"
	"time"
)

/**
  {
      "name": "bin",
      "isFile": false,
      "isDirectory": true,
      "isSymlink": false,
      "fileType": "directory",
      "imageSrc": "/api/thumbnail?path=bin",
      "svgIconName": "folder",
      "date": "2026-05-10T03:23:06.832Z",
      "size": 3195730
  }
*/

type listDirectoryRouter struct{}

type listDirectoryResultEntry struct {
	Name        string    `json:"name"`
	IsFile      bool      `json:"isFile"`
	IsDirectory bool      `json:"isDirectory"`
	IsSymlink   bool      `json:"isSymlink"`
	FileType    string    `json:"fileType"`
	ImageSrc    string    `json:"imageSrc"`
	SvgIconName string    `json:"svgIconName"`
	Date        time.Time `json:"date"`
	Size        int64     `json:"size"`
}

func (self *listDirectoryRouter) Register(approuter router.Router) {
	r := approuter.With(
		appmiddlewares.CsrfProtect,
		appmiddlewares.RequireDisk(security.StandardAccess.Read()))

	r.Get("/api/directory", self)
}

func (*listDirectoryRouter) ServeHTTP(w http.ResponseWriter, r *http.Request) {
	disk, err := appmiddlewares.GetDiskFromRequest(r)
	if err != nil {
		w.WriteHeader(http.StatusForbidden)
		return
	}

	p := r.URL.Query().Get("path")
	// Note: `fs.ReadDir` does not accept "./" at the start
	// but e.g. "docs/sub/subsub" works
	p, _ = strings.CutPrefix(p, "./")
	fsDisk := disk.Fs()
	res, err := fs.ReadDir(fsDisk, p)

	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		return
	}

	entries := make([]listDirectoryResultEntry, len(res))
	for idx := range len(res) {
		v := res[idx]
		fileInfo, err := v.Info()
		if err != nil {
			continue
		}

		fileType := "unidentified"
		svgIconName := "description"
		if fileInfo.Mode().IsDir() {
			fileType = "directory"
			svgIconName = "folder"
		}

		fullPath := path.Join(p, v.Name())
		imageSrc := fmt.Sprintf("/api/thumbnail?path=%s", url.QueryEscape(fullPath))

		entries[idx] = listDirectoryResultEntry{
			Name:        v.Name(),
			IsFile:      fileInfo.Mode().IsRegular(),
			IsDirectory: fileInfo.Mode().IsDir(),
			IsSymlink:   false,
			FileType:    fileType,
			ImageSrc:    imageSrc,
			SvgIconName: svgIconName,
			Date:        fileInfo.ModTime(),
			Size:        fileInfo.Size(),
		}
	}

	router.JsonResponse(w, entries)
}

func init() {
	approutes.Routes = append(approutes.Routes, &listDirectoryRouter{})
}
