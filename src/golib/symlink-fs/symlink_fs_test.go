package symlinkfs

import (
	"io/fs"
	"os"
	"path"
	"testing"
	"testing/fstest"
)

func createFakeSymlinkFs() fs.FS {
	fakeDir := os.TempDir()
	os.WriteFile(path.Join(fakeDir, "test"), []byte("test123"), 0x666)
	os.MkdirAll(path.Join(fakeDir, "a", "b", "c"), os.ModeDir)
	os.WriteFile(path.Join(fakeDir, "a", "test2"), []byte("test123"), 0x666)
	os.WriteFile(path.Join(fakeDir, "a", "b", "c", "test3"), []byte("test123"), 0x666)
	symlinks := make(map[string]string)
	symlinks["/test"] = path.Join(fakeDir, "test")
	symlinks["/a/"] = path.Join(fakeDir, "a")
	return New(symlinks)
}

func TestSymlinkFs(t *testing.T) {
	fstest.TestFS(createFakeSymlinkFs(), "/test", "/a/test2", "/a/b/c/test3")
}
