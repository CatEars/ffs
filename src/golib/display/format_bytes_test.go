package display

import (
	"catears/ffs/lib/assert"
	"testing"
)

func TestZeroBytes(t *testing.T) {
	assert.Equal(t, "0 Bytes", FormatBytes(0))
}

func TestBytesToGb(t *testing.T) {
	assert.Equal(t, "512 Bytes", FormatBytes(512))
	assert.Equal(t, "1 KB", FormatBytes(1024))
	assert.Equal(t, "1 MB", FormatBytes(1024*1024))
	assert.Equal(t, "1 GB", FormatBytes(1024*1024*1024))
}

func TestShowsTwoDecimalPlacesByDefault(t *testing.T) {
	assert.Equal(t, "1.46 KB", FormatBytes(1500))
}
