package autofolder

import (
	"catears/ffs/lib/assert"
	"crypto/rand"
	"os"
	"path"
	"testing"
)

var randomId = rand.Text()

func tryRemove(path string) {
	os.RemoveAll(path)
}

func TestFolderDoesNotExistThenGetWillCreateIt(t *testing.T) {
	loc := path.Join(os.TempDir(), rand.Text())
	defer tryRemove(loc)
	af := New(loc, AllAccess)
	_, err := os.Stat(loc)
	assert.NotNil(t, err)

	folder, err := af.Get()
	assert.Nil(t, err)
	assert.Equal(t, folder, loc)

	stat, err := os.Stat(loc)
	assert.Nil(t, err)
	assert.True(t, stat.IsDir())
}

func TestFolderSubCreatesSubFolder(t *testing.T) {
	loc := path.Join(os.TempDir(), rand.Text())
	defer tryRemove(loc)
	af := New(loc, AllAccess).Sub("subfolder")
	af.Get()
	stat, err := os.Stat(path.Join(loc, "subfolder"))
	assert.Nil(t, err)
	assert.True(t, stat.IsDir())
}

func TestRecreateRemovesAndRecreatesFolder(t *testing.T) {
	loc := path.Join(os.TempDir(), rand.Text())
	defer tryRemove(loc)
	af := New(loc, AllAccess)
	folder, _ := af.Get()
	os.WriteFile(path.Join(folder, "testfile"), []byte("testing"), AllAccess)
	err := af.Recreate()
	assert.Nil(t, err)
	entries, err := os.ReadDir(folder)
	assert.Nil(t, err)
	assert.Equal(t, len(entries), 0)
}
