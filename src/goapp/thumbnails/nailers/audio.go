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

var audioExtMap map[string]bool = make(map[string]bool)

func init() {
	for _, ext := range AudioExtNames {
		audioExtMap[ext] = true
	}
}

func isAudioFile(fname string) bool {
	ext := path.Ext(fname)
	_, found := audioExtMap[ext]
	return found
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
	physLoc, err := ctx.Disk.PhysicalLocation()
	if err == nil {
		return produceAudioThumbnailFromPhysicalLocation(physLoc, artFile, ctx)
	} else {
		return produceAudioThumbnailFromFs(artFile, ctx)
	}
}

func produceAudioThumbnailFromFs(artFile string, ctx *NailerContext) error {
	fhandle, err := ctx.Disk.Fs().Open(artFile)
	if err != nil {
		return err
	}
	defer fhandle.Close()

	cmd := exec.Command("convert", "-", "-thumbnail", "128x128", "-quality", "60", ctx.TempOutputPath)
	cmd.Stdin = fhandle

	err = cmd.Run()
	if err != nil {
		return err
	}

	ctx.PromoteToParent = true
	return ctx.Success()
}

func produceAudioThumbnailFromPhysicalLocation(physLoc, artFile string, ctx *NailerContext) error {
	// TODO: Reduce duplication in this file
	fpath := path.Join(physLoc, artFile)

	cmd := exec.Command("convert", fpath, "-thumbnail", "128x128", "-quality", "60", ctx.TempOutputPath)

	err := cmd.Run()
	if err != nil {
		return err
	}

	ctx.PromoteToParent = true
	return ctx.Success()
}

var _ Nailer = &AudioNailer{}
