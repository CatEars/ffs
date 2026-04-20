package security

import (
	"crypto/pbkdf2"
	"crypto/sha512"
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
