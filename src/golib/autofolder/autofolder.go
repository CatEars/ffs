package autofolder

import (
	"os"
	"path"
)

type AutoFolder struct {
	path     string
	fileperm os.FileMode
}

var AllAccess os.FileMode = 0o777
var GroupAccess os.FileMode = 0o770
var OwnAccess os.FileMode = 0o700

func New(root string, fileperm os.FileMode) *AutoFolder {
	return &AutoFolder{
		path:     root,
		fileperm: fileperm,
	}
}

func (af *AutoFolder) Get() (string, error) {
	err := os.MkdirAll(af.path, af.fileperm)
	if err != nil {
		return "", err
	}
	return af.path, nil
}

func (af *AutoFolder) Sub(subfolder string) *AutoFolder {
	return New(path.Join(af.path, subfolder), af.fileperm)
}

func (af *AutoFolder) Recreate() error {
	err := os.RemoveAll(af.path)
	if err != nil {
		return err
	}
	return os.MkdirAll(af.path, af.fileperm)
}
