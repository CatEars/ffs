package thumbnail

import (
	"catears/ffs/lib/assert"
	"testing"
)

func TestReplaceThumbnailName(t *testing.T) {
	assert.Equal(t, AsThumbnailName("/tmp/my_file.mp3"), "_tmp_my__file.mp3")
}

func TestEmptyString(t *testing.T) {
	assert.Equal(t, AsThumbnailName(""), "")
}

func TestPathWithoutExtension(t *testing.T) {
	assert.Equal(t, AsThumbnailName("/tmp/dir_or_no_dir"), "_tmp_dir__or__no__dir")
}

func TestDifferingButSimilarPathsDoNotCollide(t *testing.T) {
	assert.NotEqual(t, AsThumbnailName("/tmp/a_b_c"), AsThumbnailName("/tmp/a/b/c"))
}
