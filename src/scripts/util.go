package main

import (
	"io"
	"log"
	"net/http"
	"os"
	"path"
)

func Fatal(err error) {
	if err != nil {
		log.Fatal(err)
	}
}

func Touch(path string) error {
	_, err := os.Stat(path)
	if err == nil {
		os.Remove(path)
	}

	f, err := os.Create(path)
	if err != nil {
		return err
	}
	_, err = f.WriteString("\n")
	return err
}

func DownloadFile(url, target string) error {
	client := &http.Client{}

	resp, err := client.Get(url)
	if err != nil {
		return err
	}
	defer resp.Body.Close()

	err = os.MkdirAll(path.Dir(target), 0750)
	if err != nil {
		return err
	}

	file, err := os.Create(target)
	if err != nil {
		return err
	}
	defer file.Close()

	_, err = io.Copy(file, resp.Body)
	if err != nil {
		return err
	}

	return nil
}
