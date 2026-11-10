package main

import (
	"io/fs"
	"log"
	"os"
	"os/exec"
	"path"
	"slices"
	"strings"
)

func RunAllTests() {
	dirsToTest := []string{}
	fs.WalkDir(os.DirFS("."), "src", func(fpath string, dir os.DirEntry, err error) error {
		if err != nil {
			return err
		}

		if dir.Type().IsRegular() && strings.HasSuffix(dir.Name(), "_test.go") {
			dirPath := path.Dir(fpath)
			if !slices.Contains(dirsToTest, dirPath) {
				dirsToTest = append(dirsToTest, dirPath)
			}
		}
		return nil
	})

	for _, testablePackage := range dirsToTest {
		cmd := exec.Command("go", "test")
		cmd.Dir = testablePackage
		cmd.Stdout = os.Stdout
		cmd.Stderr = os.Stderr
		log.Println("Testing", testablePackage)
		cmd.Run()
	}
}
