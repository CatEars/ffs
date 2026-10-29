package main

import (
	"fmt"
	"io/fs"
	"os"
	"path"
	"slices"
	"strings"
	"time"
)

func GenerateTestRunTemplate() {
	templatePath := path.Join("src", "test", "test-runs", "template.md")
	manualTestsPath := path.Join("src", "test", "manual-tests")
	lines := []string{}
	err := fs.WalkDir(os.DirFS(manualTestsPath), ".", fs.WalkDirFunc(func(path string, entry os.DirEntry, err error) error {
		if err != nil {
			return err
		}
		if entry.Type().IsRegular() {
			lines = append(lines, path)
		}
		return nil
	}))
	Fatal(err)

	slices.Sort(lines)

	mdBuilder := strings.Builder{}
	mdBuilder.WriteString(fmt.Sprintf(`# Test Run - $VERSION$

Date: %s

## Tests

`, time.Now().Format("2006-01-02")))

	lastHeader := ""
	for _, line := range lines {
		headerIdx := strings.Index(line, "/")
		if headerIdx == -1 {
			mdBuilder.WriteString(fmt.Sprintln("[ ] -", line))
		} else {
			header := line[:headerIdx]
			file := line[headerIdx+1:]
			if header != lastHeader {
				mdBuilder.WriteString(fmt.Sprintln(""))
				mdBuilder.WriteString(fmt.Sprintln("###", header))
				mdBuilder.WriteString(fmt.Sprintln(""))
				lastHeader = header
			}
			mdBuilder.WriteString(fmt.Sprintln("[ ] -", file))
		}
	}
	Fatal(os.WriteFile(templatePath, []byte(mdBuilder.String()), 0o644))
}
