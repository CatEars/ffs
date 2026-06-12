package bookingstore

import (
	"crypto/rand"
	"errors"
	"fmt"
	"io"
	"os"
	"path"
	"strings"
	"time"
)

const threeDays time.Duration = time.Hour * 24 * 3

type bookingStore struct {
	baseUploadDir string
	bookings      map[BookingId]*booking
}

type BookingId string

type Booking interface {
	Id() BookingId
	CreatedAt() time.Time
	Writer() io.WriteCloser
	Reader() io.ReadSeekCloser
	Move(targetPath string) error
}

type booking struct {
	id        BookingId
	createdAt time.Time
	file      *os.File
}

func (booking *booking) Id() BookingId {
	return booking.id
}

func (booking *booking) CreatedAt() time.Time {
	return booking.createdAt
}

func (booking *booking) Writer() io.WriteCloser {
	return booking.file
}

func (booking *booking) Reader() io.ReadSeekCloser {
	return booking.file
}

func (booking *booking) Close() error {
	return booking.file.Close()
}

func (booking *booking) Move(targetPath string) error {
	err := booking.Close()
	if err != nil {
		return err
	}

	fpath := booking.file.Name()
	return os.Rename(fpath, targetPath)
}

type BookingStore interface {
	Create() (BookingId, error)
	Get(id BookingId) (Booking, bool)
	Delete(id BookingId) error
	Load() error
	ClearOld() (int, error)
}

func New(baseUploadDir string) BookingStore {
	return &bookingStore{
		baseUploadDir: baseUploadDir,
		bookings:      make(map[BookingId]*booking),
	}
}

func (store *bookingStore) Create() (BookingId, error) {
	f, err := os.CreateTemp(store.baseUploadDir, "ffs-upload-*.upload")
	if err != nil {
		return "", err
	}
	id := BookingId(rand.Text())
	createdAt := time.Now()
	store.bookings[id] = &booking{
		id:        id,
		file:      f,
		createdAt: createdAt,
	}
	return id, nil
}

func (store *bookingStore) Get(id BookingId) (Booking, bool) {
	res, ok := store.bookings[id]
	return res, ok
}

func (store *bookingStore) Delete(id BookingId) error {
	book, ok := store.bookings[id]
	if !ok {
		return fmt.Errorf("No such upload booking %s", id)
	}

	book.Close()
	delete(store.bookings, id)
	return nil
}

func (store *bookingStore) Load() error {
	return nil
}

func (store *bookingStore) ClearOld() (int, error) {
	entries, err := os.ReadDir(store.baseUploadDir)
	if err != nil {
		return 0, err
	}

	cleared := 0
	errs := []error{}
	now := time.Now()
	for _, entry := range entries {
		name := path.Base(entry.Name())
		isTempUploadFile := strings.HasPrefix(name, "ffs-upload-") && strings.HasSuffix(name, ".upload")
		if !isTempUploadFile {
			continue
		}
		fileInfo, err := entry.Info()
		if err != nil {
			errs = append(errs, err)
		} else if fileInfo.ModTime().Add(threeDays).Before(now) {
			err := os.Remove(path.Join(store.baseUploadDir, entry.Name()))
			if err != nil {
				errs = append(errs, err)
			} else {
				cleared += 1
			}
		}
	}

	return cleared, errors.Join(errs...)
}
