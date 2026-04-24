package filetype

import (
	"catears/ffs/lib/assert"
	"testing"
)

func TestIsVideoFileWorks(t *testing.T) {
	assert.True(t, IsVideoFile("/tmp/myfile.mp4"))
	assert.True(t, IsVideoFile("/tmp/myfile.MP4"))
	assert.True(t, IsVideoFile("/tmp/myfile.m4v"))

	assert.False(t, IsVideoFile("/tmp/myfile.mp3"))
	assert.False(t, IsVideoFile("/tmp/myfile.png"))
}

func TestIsSoundFileWorks(t *testing.T) {
	assert.True(t, IsSoundFile("/tmp/myfile.mp3"))
	assert.True(t, IsSoundFile("/tmp/myfile.MP3"))

	assert.False(t, IsSoundFile("/tmp/myfile.mp4"))
	assert.False(t, IsSoundFile("/tmp/myfile.png"))
}

func TestIsImageFileWorks(t *testing.T) {
	assert.True(t, IsImageFile("/tmp/myfile.png"))
	assert.True(t, IsImageFile("/tmp/myfile.GIF"))
	assert.True(t, IsImageFile("/tmp/myfile.ico"))

	assert.False(t, IsImageFile("/tmp/myfile.mp3"))
	assert.False(t, IsImageFile("/tmp/myfile.mp4"))
}
