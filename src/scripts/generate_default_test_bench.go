package main

import (
	"fmt"
	"io"
	"math/rand"
	"os"
	"path/filepath"
	"strings"
)

const albumArtSourcePath = "../app/website/static/android-chrome-192x192.png"

type Album struct {
	Name     string
	ArtFiles []string
	Tracks   []string
	Readme   string
}

// Helper to generate random strings
func generateRandomAlphanumeric(length int) string {
	const charset = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789"
	b := make([]byte, length)
	for i := range b {
		b[i] = charset[rand.Intn(len(charset))]
	}
	return string(b)
}

func copyFile(src, dst string) error {
	sourceFile, err := os.Open(src)
	if err != nil {
		return err
	}
	defer sourceFile.Close()

	destFile, err := os.Create(dst)
	if err != nil {
		return err
	}
	defer destFile.Close()

	_, err = io.Copy(destFile, sourceFile)
	return err
}

func createProgressivelyLongerFiles(directoryPath string) error {
	numberOfFiles := 20
	maxFilenameLength := 100
	lengthIncrement := maxFilenameLength / numberOfFiles

	for i := range numberOfFiles {
		length := min(1+(i*lengthIncrement), maxFilenameLength)

		filename := generateRandomAlphanumeric(length) + ".txt"
		filePath := filepath.Join(directoryPath, filename)

		err := os.WriteFile(filePath, []byte(""), 0644)
		if err != nil {
			fmt.Printf("Failed to create file %s: %v\n", filePath, err)
			continue
		}
		fmt.Printf("Created file: %s (length: %d)\n", filePath, length)
	}
	return nil
}

func createUncommonCharacterFiles(directoryPath string) error {
	uncommonChars := []string{
		"😀", "👍", "🚀", "💡", "❤️", "🌟", "🎉", "🔥", "🎶",
		"你好", "世界", "漢字", "龍", "鳳",
		"สวัสดี", "ครับ", "ภาษาไทย",
		"안녕하세요", "한글", "사랑",
		"ä", "ö", "ü", "Ä", "Ö", "Ü",
		"é", "à", "è", "ù", "ì", "ò", "ñ", "ç", "ß",
		"ŋ", "ɖ", "ɛ", "ə", "œ", "ø", "æ", "þ", "ð",
		"α", "β", "γ", "δ", "ε",
		"Привет", "Мир", "Москва",
	}

	for i := range 20 {
		var filename strings.Builder
		numParts := rand.Intn(10) + 1
		for range numParts {
			filename.WriteString(uncommonChars[rand.Intn(len(uncommonChars))])
		}
		filename.WriteString(generateRandomAlphanumeric(6))

		filePath := filepath.Join(directoryPath, filename.String())
		err := os.WriteFile(filePath, fmt.Appendf(nil, "This is file number %d.", i+1), 0644)
		if err != nil {
			fmt.Printf("Failed to create file %s: %v\n", filePath, err)
			continue
		}
		fmt.Printf("Created file: %s\n", filePath)
	}
	return nil
}

func createAlphabeticFiles(directoryPath string) error {
	alphabet := "abcdefghijklmnopqrstuvwxyz"
	count := 0
	for i := 0; i < len(alphabet); i++ {
		for j := 0; j < len(alphabet); j++ {
			for k := 0; k < len(alphabet); k++ {
				filename := fmt.Sprintf("%c%c%c.txt", alphabet[i], alphabet[j], alphabet[k])
				filePath := filepath.Join(directoryPath, filename)
				os.WriteFile(filePath, []byte(""), 0644)
				count++
			}
		}
	}
	fmt.Printf("Successfully created %d files in %s\n", count, directoryPath)
	return nil
}

func createDeeplyNestedFiles(basePath string) error {
	depth := 10
	currentPath := basePath

	for range depth {
		os.MkdirAll(currentPath, 0755)
		for range 20 {
			filename := generateRandomAlphanumeric(8)
			os.WriteFile(filepath.Join(currentPath, filename), []byte(""), 0644)
		}
		currentPath = filepath.Join(currentPath, generateRandomAlphanumeric(10))
	}
	return nil
}

func createAudioAlbums(basePath string) error {
	albums := []Album{
		{
			Name:     "Cosmic Llama - Songs From the Void",
			ArtFiles: []string{"front.jpg", "back.jpg"},
			Tracks:   []string{"01 - Into the Void.mp3", "02 - Space Llama Shuffle.mp3", "03 - Galactic Spit.mp3"},
			Readme:   "MP3 album with front/back art.",
		},
		{
			Name:     "Professor Bongo - Live at the Cheese Factory",
			ArtFiles: []string{"AlbumArt.jpg"},
			Tracks:   []string{"01 - Cheese Waltz.mp3", "02 - Weasel Stampede.mp3"},
			Readme:   "Windows Media Player convention.",
		},
		{
			Name:     "The Spectacular Turnip Orchestra - Greatest Ringtones",
			ArtFiles: []string{"cover.jpg"},
			Tracks: []string{
				"01 - Ringtone No. 1 in D Minor.mp3",
				"02 - Hold Music Fantasia.mp3",
				"03 - Elevator Jazz Supreme.mp3",
			},
			Readme: "Tests: MP3 album with a single art file named cover.jpg (common open-source player convention).",
		},
		{
			Name:     "DJ Sprocket & MC Spatula - Breakfast Bangers Vol. 2",
			ArtFiles: []string{"folder.jpg"},
			Tracks: []string{
				"01 - Waffle Drop.mp3",
				"02 - Pancake Flip (feat. The Syrup Collective).mp3",
				"03 - Scrambled Eggs Remix.mp3",
				"04 - Omelette du Jour (Radio Edit).mp3",
			},
			Readme: "Tests: MP3 album with a single art file named folder.jpg (Windows Explorer thumbnail convention).",
		},
		{
			Name:     "The Invisible Ukulele Ensemble - Self-Titled",
			ArtFiles: []string{},
			Tracks: []string{
				"01 - Transparent Chords.mp3",
				"02 - You Cant See Me But You Can Hear Me.mp3",
				"03 - The Soundless Sound.mp3",
			},
			Readme: "Tests: MP3 album with no album art at all.",
		},
		{
			Name:     "Sir Reginald Fluffington III - Opus for Cats and Thunderstorms",
			ArtFiles: []string{"front.jpg", "back.jpg"},
			Tracks: []string{
				"Track01.wav",
				"Track02.wav",
				"Track03.wav",
				"Track04.wav",
				"Track05.wav",
			},
			Readme: "Tests: WAV album (typical CD-rip layout) with two art files (front.jpg + back.jpg) and generic track names.",
		},
	}

	for _, album := range albums {
		albumDir := filepath.Join(basePath, album.Name)
		os.MkdirAll(albumDir, 0755)

		for _, art := range album.ArtFiles {
			copyFile(albumArtSourcePath, filepath.Join(albumDir, art))
		}

		for _, track := range album.Tracks {
			os.WriteFile(filepath.Join(albumDir, track), []byte(""), 0644)
		}

		os.WriteFile(filepath.Join(albumDir, "readme.txt"), []byte(album.Readme), 0644)
	}
	return nil
}

func GenerateDefaultTestBench() {
	type generator struct {
		name string
		fn   func(string) error
	}

	generators := []generator{
		{"long-filenames", createProgressivelyLongerFiles},
		{"uncommon-chars", createUncommonCharacterFiles},
		{"many-files", createAlphabeticFiles},
		{"deep-nesting", createDeeplyNestedFiles},
		{"music-library", createAudioAlbums},
	}

	for _, g := range generators {
		dir := filepath.Join("testbench", g.name)
		os.MkdirAll(dir, 0755)
		fmt.Printf("--- Running Generator: %s ---\n", g.name)
		g.fn(dir)
	}
}
