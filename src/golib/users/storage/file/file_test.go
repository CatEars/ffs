package file

import (
	"catears/ffs/lib/assert"
	"catears/ffs/lib/users"
	"encoding/json"
	"testing"
	"testing/fstest"
)

func AssertMarshalAndUnmarshalMatches(t *testing.T, val *userFromFile, expected string) {
	bytes, err := json.Marshal(val)
	assert.Nil(t, err)
	assert.Equal(t, string(bytes), expected)
	var unmarshalled *userFromFile = &userFromFile{}
	err = json.Unmarshal(bytes, unmarshalled)
	assert.Nil(t, err)
	assert.Equal(t, val, unmarshalled)
}

func TestCanCodecBasicAuthUserToJson(t *testing.T) {
	insecureUser := userFromFile{
		Username:    "insecure",
		UserType:    "insecure-basic_auth",
		Password:    "abc123",
		Key:         "api-key",
		Permissions: users.UserPermissions{},
	}
	expected := `{"type":"insecure-basic_auth","username":"insecure","password":"abc123","key":"api-key","permissions":{}}`
	AssertMarshalAndUnmarshalMatches(t, &insecureUser, expected)
}

func TestCanCodecPbkdf2UserToJson(t *testing.T) {
	secureUser := userFromFile{
		Username:    "secure",
		UserType:    "pbkdf2",
		Salt:        "salt",
		B64Hash:     "b64Hash=",
		Key:         "api-key",
		Permissions: users.UserPermissions{},
	}
	expected := `{"type":"pbkdf2","username":"secure","salt":"salt","b64Hash":"b64Hash=","key":"api-key","permissions":{}}`
	AssertMarshalAndUnmarshalMatches(t, &secureUser, expected)
}

func TestCanDecodeUsersFromDisk(t *testing.T) {
	users := fstest.MapFS{
		"users.json": {Data: []byte(`[
			{
				"type": "insecure-basic_auth",
				"username": "insecure",
				"password": "abc123",
				"key": "api-key1"
			},
			{
				"type": "pbkdf2",
				"username": "secure",
				"salt": "salt",
				"b64Hash": "b64Hash=",
				"key": "api-key2"
			}
		]`)},
	}
	fileSource := New(users, "users.json")
	err := fileSource.Configure()
	assert.Nil(t, err)
	assert.NotNil(t, fileSource.users["insecure"])
	assert.NotNil(t, fileSource.users["secure"])
	assert.Equal(t, len(fileSource.users), 2)
}

func TestReturnsErrorWhenMultipleUsersHaveSameName(t *testing.T) {
	users := fstest.MapFS{
		"users.json": {Data: []byte(`[
			{
				"type": "insecure-basic_auth",
				"username": "insecure",
				"password": "abc123",
				"key": "api-key3"
			},
			{
				"type": "pbkdf2",
				"username": "insecure",
				"salt": "salt",
				"b64Hash": "b64Hash=",
				"key": "api-key4"
			}
		]`)},
	}
	fileSource := New(users, "users.json")
	err := fileSource.Configure()
	assert.NotNil(t, err)
	assert.Equal(t, len(fileSource.users), 0)
}

func TestReturnsErrorWhenMultipleUsersHaveSameKey(t *testing.T) {
	users := fstest.MapFS{
		"users.json": {Data: []byte(`[
			{
				"type": "insecure-basic_auth",
				"username": "insecure1",
				"password": "abc123",
				"key": "same-api-key"
			},
			{
				"type": "insecure-basic_auth",
				"username": "insecure2",
				"password": "abc123",
				"key": "same-api-key"
			}
		]`)},
	}
	fileSource := New(users, "users.json")
	err := fileSource.Configure()
	assert.NotNil(t, err)
	assert.Equal(t, len(fileSource.users), 0)
}

func TestSkipsPoorlyConfiguredUsers(t *testing.T) {
	users := fstest.MapFS{
		"users.json": {Data: []byte(`[
			{
				"type": "insecure-basic_auth",
				"username": "insecure",
				"password": "abc123",
				"key": "api-key5"
			},
			{
				"type": "insecure-basic_auth",
				"username": "insecure-and-missing"
			},
			{
				"type": "pbkdf2",
				"username": "secure",
				"salt": "salt",
				"b64Hash": "b64Hash=",
				"key": "api-key6"
			},
			{
				"type": "pbkdf2",
				"username": "secure-but-missing",
				"b64Hash": "b64Hash=",
				"key": "api-key7"
			}
		]`)},
	}
	fileSource := New(users, "users.json")
	err := fileSource.Configure()
	assert.Nil(t, err)
	assert.Equal(t, len(fileSource.users), 2)
}

func TestMatchesUsersOfBothTypes(t *testing.T) {
	users := fstest.MapFS{
		"users.json": {Data: []byte(`[
			{
				"type": "insecure-basic_auth",
				"username": "🗝️-catears",
				"password": "abc123",
				"key": "same-api-key"
			},
			{
				"type": "pbkdf2",
				"username": "🔑-catears",
				"b64Hash": "oBabrExDM+/ULOD16CdSKgQkzNR8MMAcQyVdedor8/6Dbk8RtGuYlJdrfHWKzwNxyA29k5w1D1aWNBM4IdkXiA==",
				"salt": "MR0QRS26t5dGdqLc",
				"key": "8LQgWJYuC1wMAFnj"
			}
		]`)},
	}
	fileSource := New(users, "users.json")
	err := fileSource.Configure()
	assert.Nil(t, err)
	usr1 := fileSource.MatchUser("🗝️-catears", "abc123")
	usr2 := fileSource.MatchUser("🔑-catears", "hunter2")
	assert.NotNil(t, usr1)
	assert.NotNil(t, usr2)
}
