package autofolder

import (
	"errors"
	"os"
	"path"
)

type AutoFolder interface {
	Get() (string, error)
	Sub(subfolder string) AutoFolder
	Recreate() error
}

type autoFolder struct {
	path     string
	fileperm os.FileMode
}

var AllAccess os.FileMode = 0o777
var GroupAccess os.FileMode = 0o770
var OwnAccess os.FileMode = 0o700

func New(root string, fileperm os.FileMode) AutoFolder {
	return &autoFolder{
		path:     root,
		fileperm: fileperm,
	}
}

func (af *autoFolder) Get() (string, error) {
	err := os.MkdirAll(af.path, af.fileperm)
	if err != nil {
		return "", err
	}
	return af.path, nil
}

func (af *autoFolder) Sub(subfolder string) AutoFolder {
	return New(path.Join(af.path, subfolder), af.fileperm)
}

func (af *autoFolder) Recreate() error {
	err := os.RemoveAll(af.path)
	if err != nil {
		return err
	}
	return os.MkdirAll(af.path, af.fileperm)
}

type sentinelFolder struct{}

func NewSentinel() AutoFolder {
	return &sentinelFolder{}
}

func (*sentinelFolder) Get() (string, error) {
	return "", errors.New("Uninitialized")
}

func (self *sentinelFolder) Sub(subfolder string) AutoFolder {
	return self
}

func (*sentinelFolder) Recreate() error {
	return errors.New("Uninitialized")
}
