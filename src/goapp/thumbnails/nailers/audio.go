package nailers

import (
	"os"
	"os/exec"
	"path"
	"strings"
)

var AudioExtNames []string = []string{
	".mp3",
	".wav",
	".ogg",
	".flac",
	".aac",
	".m4a",
	".opus",
	".wma",
	".ape",
}

var folderArtNames []string = []string{
	"cover", "folder", "albumart", "album", "front", "artwork",
}

var folderArtExtensions []string = []string{
	".jpg", ".jpeg", ".png", ".webp",
}

var allFolderArtCombinations map[string]bool

func init() {
	allFolderArtCombinations = make(map[string]bool)
	for _, name := range folderArtNames {
		for _, ext := range folderArtExtensions {
			allFolderArtCombinations[name+ext] = true
		}
	}
}

type AudioNailer struct{}

func findFolderArt(entries []os.DirEntry) (os.DirEntry, bool) {
	for _, entry := range entries {
		name := strings.ToLower(entry.Name())
		_, found := allFolderArtCombinations[name]
		if found {
			return entry, true
		}
	}

	return nil, false
}

func (*AudioNailer) Generate(ctx *NailerContext) error {
	parentDir := path.Dir(ctx.FilePath)
	entries, err := os.ReadDir(parentDir)
	if err != nil {
		return err
	}

	folderArtEntry, found := findFolderArt(entries)
	if !found {
		return nil
	}

	artFile := path.Join(parentDir, folderArtEntry.Name())
	cmd := exec.Command("convert", artFile, "-thumbnail", "128x128", "-quality", "60", ctx.TempOutputPath)

	err = cmd.Run()
	if err != nil {
		return err
	}

	ctx.PromoteToParent = true
	return ctx.Success()
}

var _ Nailer = &AudioNailer{}
