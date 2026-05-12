package security

import (
	"crypto/hmac"
	"crypto/sha256"
)

func SignBlob(key, blob []byte) ([]byte, error) {
	mac := hmac.New(sha256.New, key)
	_, err := mac.Write(blob)
	if err != nil {
		return []byte{}, err
	}

	return mac.Sum(nil), nil
}

func VerifyBlobSignature(key, blob, signature []byte) (bool, error) {
	currentSignature, err := SignBlob(key, blob)
	if err != nil {
		return false, err
	}

	return hmac.Equal(currentSignature, signature), nil
}
