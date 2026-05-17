package security

import (
	"crypto/pbkdf2"
	"crypto/sha512"
	"crypto/subtle"
	"encoding/base64"
)

func Pbkdf2Hash(password, salt string) (string, error) {
	saltBytes := []byte(salt)
	key, err := pbkdf2.Key(sha512.New, password, saltBytes, 1_000_000, 64)
	if err != nil {
		return "", err
	}
	return base64.StdEncoding.EncodeToString(key), nil
}

func PasswordEqual(givenPassword, salt, b64HashedPassword string) (bool, error) {
	hashed, err := Pbkdf2Hash(givenPassword, salt)
	if err != nil {
		return false, err
	}
	return subtle.ConstantTimeCompare([]byte(b64HashedPassword), []byte(hashed)) == 1, nil
}
