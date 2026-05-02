package main

import (
	"log"
)

func CreatePersonalFiles() {
	filesToCreate := []string{
		"./src/app/website/templates/base.personal.html",
	}

	for _, filePath := range filesToCreate {
		err := Touch(filePath)
		Fatal(err)
		log.Printf("Created empty file %s\n", filePath)
	}
}
