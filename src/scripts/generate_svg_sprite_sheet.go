package main

import (
	"fmt"
	"log"
	"os"
	"path"
	"regexp"
	"sort"
	"strings"
)

var inputFolder = path.Join("src", "app", "website", "static", "svg")
var outputFile = path.Join("src", "app", "website", "static", "svg", "sprite_sheet.svg")

var svgSpriteHeader = `<svg xmlns="http://www.w3.org/2000/svg" style="display: none;">` + "\n"
var svgSpriteFooter = "\n" + `</svg>`

func GenerateSvgSpriteSheet() {
	entries, err := os.ReadDir(inputFolder)
	sprites := []string{}
	Fatal(err)
	for _, entry := range entries {
		if strings.Contains(entry.Name(), "sprite_sheet.svg") {
			continue
		}
		filePath := path.Join(inputFolder, entry.Name())
		svgContentBytes, err := os.ReadFile(filePath)
		Fatal(err)
		//svgContent := string(svgContentBytes)
		iconId := strings.TrimSuffix(entry.Name(), ".svg")
		matcher := regexp.MustCompile(`<path\s+d="([^"]+)"`)
		match := matcher.FindSubmatch(svgContentBytes)
		if len(match) > 1 {
			pathData := match[1]
			symbol := fmt.Sprintf(
				`  <symbol id="%s" fill="currentColor" viewBox="0 -960 960 960">
    <path d="%s" />
  </symbol>`, iconId, pathData)
			sprites = append(sprites, symbol)
		} else {
			log.Println("WARN: Could not find a <path> or viewBox in", filePath)
		}
	}

	sort.Strings(sprites)
	finalSpriteContent := svgSpriteHeader + strings.Join(sprites, "\n\n") + svgSpriteFooter

	os.WriteFile(outputFile, []byte(finalSpriteContent), 0o666)
}
