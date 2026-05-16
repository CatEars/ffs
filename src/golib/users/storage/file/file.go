package file

import (
	"catears/ffs/lib/users"
	"io/fs"
)

type FileUserSource struct {
	fsys         fs.FS
	userFilePath string
	users        *map[string]users.UserRecord
}

type userFromFile struct {
	UserType string `json:"type"`
	Password string `json:"password,omitempty"`
	Salt     string `json:"salt,omitempty"`
	B64Hash  string `json:"b64Hash,omitempty"`
	Key      string `json:"key,omitempty"`
}

func New(fsys fs.FS, userFilePath string) *FileUserSource {
	return &FileUserSource{
		fsys:         fsys,
		userFilePath: userFilePath,
	}
}

func convertUserfileContent(content []byte) (*map[string]users.UserRecord, error) {
	return nil, nil
}

func (fus *FileUserSource) Configure() error {
	fcontent, err := fs.ReadFile(fus.fsys, fus.userFilePath)
	if err != nil {
		return err
	}

	fus.users, err = convertUserfileContent(fcontent)
	if err != nil {
		return err
	}
	return nil
}

func (fus *FileUserSource) MatchUser(username, password string) *users.UserRecord {
	return nil
}
