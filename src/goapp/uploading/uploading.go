package uploading

import (
	bookingstore "catears/ffs/lib/booking-store"
)

var BookingStore bookingstore.BookingStore

func InitUploadStore(store bookingstore.BookingStore) {
	BookingStore = store
}
