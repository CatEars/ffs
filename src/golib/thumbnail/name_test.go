package thumbnail

import (
	"catears/ffs/lib/assert"
	"catears/ffs/lib/autofolder"
	"testing"
)

type testableAutofolder struct {
	Subs []string
}

func newTestableAutofolder() *testableAutofolder {
	return &testableAutofolder{
		Subs: []string{},
	}
}

func (*testableAutofolder) Get() (string, error) {
	return "", nil
}

func (t *testableAutofolder) Sub(s string) autofolder.AutoFolder {
	t.Subs = append(t.Subs, s)
	return t
}

func (*testableAutofolder) Recreate() error {
	return nil
}

func (*testableAutofolder) Peek() string {
	return ""
}

func TestReplaceThumbnailName(t *testing.T) {
	assert.Equal(t, AsThumbnailName("/tmp/my_file.mp3"), "_tmp_my__file.mp3.webp")
}

func TestEmptyString(t *testing.T) {
	assert.Equal(t, AsThumbnailName(""), "")
}

func TestPathWithoutExtension(t *testing.T) {
	assert.Equal(t, AsThumbnailName("/tmp/dir_or_no_dir"), "_tmp_dir__or__no__dir.webp")
}

func TestDifferingButSimilarPathsDoNotCollide(t *testing.T) {
	assert.NotEqual(t, AsThumbnailName("/tmp/a_b_c"), AsThumbnailName("/tmp/a/b/c"))
}

func getSubFolder(filePath string) *testableAutofolder {
	af := newTestableAutofolder()
	ResolveThumbnailFolder(af, "default-disk", filePath)
	return af
}

func TestResolveThumbnailFolder(t *testing.T) {
	af := getSubFolder("/tmp/my_file.mp3")
	assert.Equal(t, len(af.Subs), 3)
	assert.Equal(t, af.Subs[0], "default-disk")
	assert.Equal(t, af.Subs[1], "my_")
	assert.Equal(t, af.Subs[2], "fil")
}

func TestResolveThumbnailFolderWithTooShortNameRepeatsLastNonExtensionCharacter(t *testing.T) {
	af := getSubFolder("/tmp/my.jpg")
	assert.Equal(t, len(af.Subs), 3)
	assert.Equal(t, af.Subs[0], "default-disk")
	assert.Equal(t, af.Subs[1], "myy")
	assert.Equal(t, af.Subs[2], "yyy")
}

func TestResolveThumbnailFolderWithNoExtension(t *testing.T) {
	af := getSubFolder("/tmp/no_ext")
	assert.Equal(t, len(af.Subs), 3)
	assert.Equal(t, af.Subs[0], "default-disk")
	assert.Equal(t, af.Subs[1], "no_")
	assert.Equal(t, af.Subs[2], "ext")
}

func TestResolveThumbnailFolderWithNoExtensionAndShort(t *testing.T) {
	af := getSubFolder("/tmp/no")
	assert.Equal(t, len(af.Subs), 3)
	assert.Equal(t, af.Subs[0], "default-disk")
	assert.Equal(t, af.Subs[1], "noo")
	assert.Equal(t, af.Subs[2], "ooo")
}

func TestResolveThumbnailFolderWithDotfile(t *testing.T) {
	// Dotfiles are special cases where the dot is not indicative of a file extension, but we instead discard the initial dot
	af := getSubFolder(".bashrc")
	assert.Equal(t, len(af.Subs), 3)
	assert.Equal(t, af.Subs[0], "default-disk")
	assert.Equal(t, af.Subs[1], "bas")
	assert.Equal(t, af.Subs[2], "hrc")
}
