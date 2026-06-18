package upload

import (
	approutes "catears/ffs/goapp/app-routes"
	"catears/ffs/goapp/appmiddlewares"
	"catears/ffs/goapp/disks"
	"catears/ffs/goapp/resources"
	"catears/ffs/goapp/uploading"
	bookingstore "catears/ffs/lib/booking-store"
	"catears/ffs/lib/router"
	"catears/ffs/lib/security"
	"encoding/json"
	"io"
	"net/http"
	"os"
)

type uploadCommitRouter struct{}

func (self *uploadCommitRouter) Register(approuter router.Router) {
	r := approuter.With(appmiddlewares.CsrfProtect,
		appmiddlewares.EnsureClaim(resources.DiskResources, resources.DiskResources.GetClaim(security.StandardAccess.Write())))

	r.Post("/api/upload/commit", self)
}

type requestData struct {
	Token     string `json:"token"`
	Directory string `json:"directory"`
	Filename  string `json:"fileName"`
}

func (*uploadCommitRouter) ServeHTTP(w http.ResponseWriter, r *http.Request) {
	data := &requestData{}
	err := json.NewDecoder(r.Body).Decode(data)
	if err != nil {
		w.WriteHeader(http.StatusBadRequest)
		return
	}

	booking, ok := uploading.BookingStore.Get(bookingstore.BookingId(data.Token))
	if !ok {
		w.WriteHeader(http.StatusNotFound)
		return
	}
	defer booking.Clean()

	disk := disks.GetDisk(disks.DiskIndexFromRequest(r))

	modfs, err := disk.ModFs()
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		return
	}

	modfs, err = modfs.Sub(data.Directory)
	if err != nil {
		w.WriteHeader(http.StatusBadRequest)
		return
	}

	bookingWithLocation, ok1 := booking.(bookingstore.BookingWithLocation)
	modfsWithLocation, ok2 := modfs.(disks.ModFSWithLocation)
	if ok1 && ok2 {
		sourcePath := bookingWithLocation.AbsPath()
		targetPath, err := modfsWithLocation.AbsPath(data.Filename)
		if err == nil {
			err = os.Rename(sourcePath, targetPath)
			if err == nil {
				w.WriteHeader(http.StatusOK)
				return
			}
		}
	}

	reader := booking.Reader()
	reader.Seek(0, io.SeekStart)
	f, err := modfs.Create(data.Filename)
	if err != nil {
		w.WriteHeader(http.StatusConflict)
		return
	}

	go io.Copy(f, reader)
	w.WriteHeader(http.StatusAccepted)
}

func init() {
	approutes.Routes = append(approutes.Routes, &uploadCommitRouter{})
}
