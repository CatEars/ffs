package main

import (
	"io"
	"log"
	"net/http"
	"os"
	"os/exec"
	"path"
)

func Fatal(err error) {
	if err != nil {
		log.Fatal(err)
	}
}

func Touch(path string) error {
	os.Remove(path)
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

func EnsureDir(dir string) {
	os.MkdirAll(dir, 0o777)
}

func EnsureDirFromCwd(dirs ...string) {
	cwd := GetCwdOrFail()
	fullPath := append([]string{cwd}, dirs...)
	EnsureDir(path.Join(fullPath...))
}

func GetCwdOrFail() string {
	cwd, err := os.Getwd()
	Fatal(err)
	return cwd
}

func RunBash(file string) error {
	cwd := GetCwdOrFail()
	cmd := exec.Command("bash", path.Join(cwd, file))
	cmd.Stdin = os.Stdin
	cmd.Stdout = os.Stdout
	cmd.Stderr = os.Stderr
	return cmd.Run()
}
