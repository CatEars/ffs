package bookingstore

import (
	"catears/ffs/lib/assert"
	"crypto/rand"
	"fmt"
	"io"
	"os"
	"path"
	"strings"
	"testing"
	"time"
)

var store BookingStore = New(os.TempDir())

func createAndGetBooking(t *testing.T) Booking {
	id, err := store.Create()
	assert.Nil(t, err)

	booking, ok := store.Get(id)
	assert.True(t, ok)

	return booking
}

func writeContent(t *testing.T, booking Booking) string {
	expectedContent := strings.Builder{}
	for idx := range 100 {
		chunk := fmt.Sprintf("abc%d|", idx)
		expectedContent.WriteString(chunk)
		n, err := io.WriteString(booking.Writer(), chunk)
		assert.Nil(t, err)
		expectedWritten := len(chunk)
		assert.Equal(t, n, expectedWritten)
	}

	return expectedContent.String()
}

func TestBookingCanBeCreatedWrittenToAndFinalizedWithMove(t *testing.T) {
	booking := createAndGetBooking(t)
	expectedContent := writeContent(t, booking)

	fpath := path.Join(os.TempDir(), rand.Text())
	defer os.Remove(fpath)
	err := booking.Move(fpath)
	assert.Nil(t, err)
	finalContent, err := os.ReadFile(fpath)
	assert.Equal(t, string(finalContent), expectedContent)
}

func TestBookingCanBeReadViaReaderOnceFinalizedWithReader(t *testing.T) {
	booking := createAndGetBooking(t)
	expectedContent := writeContent(t, booking)

	fpath := path.Join(os.TempDir(), rand.Text())
	defer os.Remove(fpath)

	f, err := os.Create(fpath)
	assert.Nil(t, err)

	reader := booking.Reader()
	reader.Seek(0, io.SeekStart)
	_, err = io.Copy(f, reader)

	assert.Nil(t, err)
	assert.Nil(t, f.Close())

	finalContent, err := os.ReadFile(fpath)
	assert.Equal(t, string(finalContent), expectedContent)
}

func TestOldUnfinishedBookingFilesAreClearedProperly(t *testing.T) {
	_store := store.(*bookingStore)
	fpath := path.Join(_store.baseUploadDir, "ffs-upload-"+rand.Text()+".upload")
	assert.Nil(t, os.WriteFile(fpath, []byte("test"), 0o666))
	fiveDaysAgo := time.Now().Add(-1 * time.Hour * 24 * 5)
	assert.Nil(t, os.Chtimes(fpath, fiveDaysAgo, fiveDaysAgo))

	cleared, err := store.ClearOld()
	assert.Nil(t, err)
	assert.Equal(t, cleared, 1)
	_, err = os.Stat(fpath)
	assert.NotNil(t, err)
}
