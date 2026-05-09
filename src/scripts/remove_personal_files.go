package main

import (
	"io/fs"
	"log"
	"os"
	"strings"
)

func RemovePersonalFiles() {
	fs.WalkDir(os.DirFS("."), ".", func(path string, d fs.DirEntry, err error) error {
		Fatal(err)
		lowerName := strings.ToLower(d.Name())
		if strings.Contains(lowerName, ".personal.") && d.Type().IsRegular() {
			err = os.Remove(path)
			Fatal(err)
			log.Println("Removed: ", path)
		}

		return nil
	})
}
