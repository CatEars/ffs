package security

import (
	"crypto/hmac"
	"crypto/sha256"
)

// Type alias for signature
type Signature = []byte

// Uses `key` to sign `blob`
func SignBlob(key, blob []byte) (Signature, error) {
	mac := hmac.New(sha256.New, key)
	_, err := mac.Write(blob)
	if err != nil {
		return []byte{}, err
	}

	return mac.Sum(nil), nil
}

// Uses `key` to ensure `blob` has signature `signature`
func VerifyBlobSignature(key, blob []byte, signature Signature) (bool, error) {
	currentSignature, err := SignBlob(key, blob)
	if err != nil {
		return false, err
	}

	return hmac.Equal(currentSignature, signature), nil
}
