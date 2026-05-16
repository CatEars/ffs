package security

import (
	"catears/ffs/lib/assert"
	"encoding/base64"
	"regexp"
	"testing"
)

var key = []byte("testkey")
var data = []byte("This is my data")
var badData = []byte("This is not my data")

func TestValidSignatureIsCorrectlyVerified(t *testing.T) {
	signature, err := SignBlob(key, data)
	assert.Nil(t, err)
	valid, err := VerifyBlobSignature(key, data, signature)
	assert.Nil(t, err)
	assert.True(t, valid)
}

func TestInvalidSignatureIsCorrectlyVerified(t *testing.T) {
	signature, err := SignBlob(key, data)
	assert.Nil(t, err)
	valid, err := VerifyBlobSignature(key, badData, signature)
	assert.Nil(t, err)
	assert.False(t, valid)
}

func TestSignatureCanBeMarshalledToUrlEncodedValue(t *testing.T) {
	signature, err := SignBlob(key, data)
	assert.Nil(t, err)
	b64ed := base64.URLEncoding.EncodeToString(signature)
	containsOnlyHexChars, err := regexp.Match(`[0-9a-zA-Z\-_]+`, []byte(b64ed))
	assert.Nil(t, err)
	assert.True(t, containsOnlyHexChars)
}
