package main

import (
	"catears/ffs/lib/security"
	"encoding/json"
	"flag"
	"fmt"
	"log"
	"math/rand/v2"
	"os"
)

type Pbkdf2HashObject struct {
	Type     string `json:"type"`
	Username string `json:"username"`
	B64Hash  string `json:"b64Hash"`
	Salt     string `json:"salt"`
	Key      string `json:"key"`
}

func randomString() string {
	length := 16
	const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
	result := make([]byte, length)
	for i := range result {
		result[i] = charset[rand.IntN(len(charset))]
	}
	return string(result)
}

func main() {
	username := flag.String("username", "", "Username to encode into the password entry (required)")
	password := flag.String("password", "", "Password to encode into the password entry (required)")
	flag.Parse()

	if *username == "" || *password == "" {
		flag.Usage()
		os.Exit(1)
	}

	salt := randomString()
	res, err := security.Pbkdf2Hash(*password, salt)
	if err != nil {
		log.Fatalln(err)
	}
	marshalled, err := json.Marshal(Pbkdf2HashObject{
		Type:     "pbkdf2",
		Username: *username,
		B64Hash:  string(res),
		Salt:     salt,
		Key:      randomString(),
	})
	if err != nil {
		log.Fatalln(err)
	}
	fmt.Println(string(marshalled))
}
