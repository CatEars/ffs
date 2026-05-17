package file

import (
	"catears/ffs/lib/users"
	"encoding/json"
	"errors"
	"fmt"
	"io/fs"
	"log"
	"strings"
)

// `FileUserSource` reads users from a file on disk
//
// Users are either of type "insecure-basic_auth" or "pbkdf2". pbkdf2 users are preferred and they
// are created via the `pbkdf2_printer` executable script.
type FileUserSource struct {
	fsys         fs.FS
	userFilePath string
	users        map[string]userFromFile
}

type userFromFile struct {
	UserType    string                `json:"type"`
	Username    string                `json:"username"`
	Password    string                `json:"password,omitempty"`
	Salt        string                `json:"salt,omitempty"`
	B64Hash     string                `json:"b64Hash,omitempty"`
	Key         string                `json:"key,omitempty"`
	Permissions users.UserPermissions `json:"permissions"`
}

func (uff *userFromFile) InvalidFields() []string {
	fails := []string{}
	if uff.Username == "" {
		fails = append(fails, "<username - needs to be set to a unique value>")
	}

	if uff.Key == "" {
		fails = append(fails, "<key - needs to be set to a unique value>")
	}

	if uff.UserType == "insecure-basic_auth" {
		if uff.Password == "" {
			fails = append(fails, "<password - insecure basic auth users need to set a plain text 'password'>")
		}
	} else if uff.UserType == "pbkdf2" {
		if uff.Salt == "" {
			fails = append(fails, "<salt - needs to be set, will be used in password verification>")
		}

		if uff.B64Hash == "" {
			fails = append(fails, "<b64Hash - needs to be set to Base64 encoded password hash, use pbkdf2_printer to generate a user>")
		}
	} else {
		fails = append(fails, "<type - needs to be either 'insecure-basic_auth' or 'pbkdf2'>")
	}

	return fails
}

func (lhs *userFromFile) Equal(rhs *userFromFile) bool {
	return lhs.UserType == rhs.UserType &&
		lhs.Username == rhs.Username &&
		lhs.Password == rhs.Password &&
		lhs.Salt == rhs.Salt &&
		lhs.B64Hash == rhs.B64Hash &&
		lhs.Key == rhs.Key
}

func New(fsys fs.FS, userFilePath string) *FileUserSource {
	return &FileUserSource{
		fsys:         fsys,
		userFilePath: userFilePath,
	}
}

func (fus *FileUserSource) convertUserfileContent(content []byte) (map[string]userFromFile, error) {
	var usersFile *[]userFromFile = &[]userFromFile{}
	err := json.Unmarshal(content, usersFile)
	var mapped map[string]userFromFile = map[string]userFromFile{}
	var foundKeys map[string]string = map[string]string{}
	for _, user := range *usersFile {
		_, ok := mapped[user.Username]
		if ok {
			msg := fmt.Sprintf("User '%s' appeared multiple times in %s, "+
				"will not read ANY user from the invalid file with duplicate users", user.Username, fus.userFilePath)
			return nil, errors.New(msg)
		}

		otherUser, keyExists := foundKeys[user.Key]
		if keyExists {
			msg := fmt.Sprintf("User '%s' from %s has the same API key as user '%s', "+
				"will not read ANY user from the invalid file with non-unique keys", user.Username, fus.userFilePath, otherUser)
			return nil, errors.New(msg)
		}

		invalidFields := user.InvalidFields()
		if len(invalidFields) > 0 {
			joined := strings.Join(invalidFields, ", ")
			log.Printf("User '%s' from '%s' needs to be properly configured to be able to log on: %s", user.Username, fus.userFilePath, joined)
			continue
		}

		mapped[user.Username] = user
		foundKeys[user.Key] = user.Username

	}
	return mapped, err
}

func (fus *FileUserSource) Configure() error {
	fcontent, err := fs.ReadFile(fus.fsys, fus.userFilePath)
	if err != nil {
		return err
	}

	fus.users, err = fus.convertUserfileContent(fcontent)
	if err != nil {
		return err
	}
	return nil
}

func (fus *FileUserSource) MatchUser(username, password string) *users.UserRecord {
	if fus.users == nil {
		return nil
	}
	return nil
}
