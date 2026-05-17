package file

import (
	"catears/ffs/lib/security"
	"catears/ffs/lib/users"
	"encoding/json"
	"errors"
	"fmt"
	"io/fs"
	"log"
	"path"
	"strings"
)

// `FileUserSource` reads users from a file on disk, or from a directory.
//
// Users are either of type "insecure-basic_auth" or "pbkdf2". pbkdf2 users are preferred and they
// are created via the `pbkdf2_printer` executable script.
type FileUserSource struct {
	fsys              fs.FS
	userFilePath      string
	userDirectoryPath string
	users             map[string]userFromFile
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

// Create `FileUserSource` that reads users from a json file.
//
// The json file must be a list of objects, where each object corresponds
// to a user. The preferred way to create the objects is via pbkdf2_printer script
// but you can also check out the `data` folder for examples.
func NewUserFromFile(fsys fs.FS, userFilePath string) *FileUserSource {
	return &FileUserSource{
		fsys:         fsys,
		userFilePath: userFilePath,
	}
}

// Create `FileUserSource` that reads users from a directory.
//
// Each json file in the directory should contain exacly one user object.
// The preferred way to create the objects is via pbkdf2_printer script
// but you can also check out the `data` folder for examples.
func NewUsersFromDirectory(fsys fs.FS, directoryPath string) *FileUserSource {
	return &FileUserSource{
		fsys:              fsys,
		userDirectoryPath: directoryPath,
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

func (fus *FileUserSource) configureDirectoryReader() error {
	fentries, err := fs.ReadDir(fus.fsys, fus.userDirectoryPath)
	if err != nil {
		return err
	}
	var mapped map[string]userFromFile = map[string]userFromFile{}
	var foundKeys map[string]string = map[string]string{}
	var filenameByUser map[string]string = map[string]string{}
	for _, entry := range fentries {
		if entry.Type().IsRegular() && strings.HasSuffix(entry.Name(), ".json") {
			user, err := fus.readSingleUserFile(entry)
			if err != nil {
				return err
			}

			if user == nil {
				continue
			}

			origFile, ok := filenameByUser[user.Username]
			if ok {
				msg := fmt.Sprintf("User '%s' appeared multiple times in %s (in file %s and %s), "+
					"will not read ANY user from the invalid file with duplicate users", user.Username, fus.userDirectoryPath, origFile, entry.Name())
				return errors.New(msg)
			}

			otherUser, keyExists := foundKeys[user.Key]
			if keyExists {
				msg := fmt.Sprintf("User '%s' in file %s/%s has the same API key as user '%s' in file %s/%s, "+
					"will not read ANY user from the invalid file with non-unique keys", user.Username, fus.userDirectoryPath, origFile, otherUser, fus.userDirectoryPath, entry.Name())
				return errors.New(msg)
			}

			mapped[user.Username] = *user
			foundKeys[user.Key] = user.Username
			filenameByUser[user.Username] = entry.Name()
		}
	}

	fus.users = mapped
	return nil
}

func (fus *FileUserSource) readSingleUserFile(entry fs.DirEntry) (*userFromFile, error) {
	content, err := fs.ReadFile(fus.fsys, path.Join(fus.userDirectoryPath, entry.Name()))
	if err != nil {
		return nil, err
	}

	user := &userFromFile{}
	err = json.Unmarshal(content, user)
	if err != nil {
		return nil, err
	}

	invalidFields := user.InvalidFields()
	if len(invalidFields) > 0 {
		joined := strings.Join(invalidFields, ", ")
		log.Printf("User '%s' from '%s' needs to be properly configured to be able to log on: %s", user.Username, fus.userFilePath, joined)
		// Dont treat invalid fields as an error, but dont create the user
		return nil, nil
	}

	return user, nil
}

func (fus *FileUserSource) configureFileReader() error {
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

func (fus *FileUserSource) Configure() error {
	if fus.userDirectoryPath != "" {
		return fus.configureDirectoryReader()
	} else {
		return fus.configureFileReader()
	}
}

func convertUser(user *userFromFile) *users.UserRecord {
	// TODO: For now we give everyone root access,
	// lets fix this later via claims structure
	return &users.UserRecord{
		Username: user.Username,
		Claims: []*security.Claim{
			&security.RootClaim,
		},
	}
}

func (fus *FileUserSource) MatchUser(username, password string) *users.UserRecord {
	if fus.users == nil {
		return nil
	}
	matchingUser, ok := fus.users[username]
	if !ok {
		return nil
	}

	if matchingUser.UserType == "insecure-basic_auth" {
		if matchingUser.Password == password {
			return convertUser(&matchingUser)
		} else {
			return nil
		}
	} else if matchingUser.UserType == "pbkdf2" {
		equal, err := security.PasswordEqual(password, matchingUser.Salt, matchingUser.B64Hash)
		if err != nil || !equal {
			// swallow error when password comparison fails
			return nil
		}
		return convertUser(&matchingUser)
	} else {
		return nil
	}
}

func (fus *FileUserSource) Name() string {
	if fus.userFilePath != "" {
		return fmt.Sprintf("Users from file '%s'", fus.userFilePath)
	} else {
		return fmt.Sprintf("Users from directory '%s'", fus.userDirectoryPath)
	}
}
