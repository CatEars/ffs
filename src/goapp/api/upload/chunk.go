package upload

import (
	approutes "catears/ffs/goapp/app-routes"
	"catears/ffs/goapp/uploading"
	bookingstore "catears/ffs/lib/booking-store"
	"catears/ffs/lib/router"
	"io"
	"net/http"
)

type uploadChunkRouter struct{}

func (self *uploadChunkRouter) Register(approuter router.Router) {
	r := approuter.Without()

	r.Post("/api/upload/chunk", self)
}

func (*uploadChunkRouter) ServeHTTP(w http.ResponseWriter, r *http.Request) {
	bookingId := bookingstore.BookingId(r.URL.Query().Get("token"))
	booking, ok := uploading.BookingStore.Get(bookingId)

	if !ok {
		w.WriteHeader(http.StatusNotFound)
		return
	}

	io.Copy(booking.Writer(), r.Body)
	w.WriteHeader(http.StatusOK)
}

func init() {
	approutes.Routes = append(approutes.Routes, &uploadChunkRouter{})
}
