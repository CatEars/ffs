package nailers

import (
	"catears/ffs/lib/datastructure"
	"catears/ffs/lib/functional"
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

var folderArtNamesAndExtensions = functional.Product(folderArtNames, folderArtExtensions, functional.Sum.String)
var allFolderArtCombinations = datastructure.NewSetFromSlice(folderArtNamesAndExtensions)

type AudioNailer struct{}

func findFolderArt(entries []os.DirEntry) (os.DirEntry, bool) {
	for _, entry := range entries {
		name := strings.ToLower(entry.Name())
		if allFolderArtCombinations.Has(name) {
			return entry, true
		}
	}

	return nil, false
}

func runAudioCommand(cmd *exec.Cmd, ctx *NailerContext) error {
	err := cmd.Run()
	if err != nil {
		return err
	}

	ctx.PromoteToParent = true
	return ctx.Success()
}

func produceAudioThumbnailFromFs(artFile string, ctx *NailerContext) error {
	fhandle, err := ctx.Disk.Fs().Open(artFile)
	if err != nil {
		return err
	}
	defer fhandle.Close()

	cmd := exec.Command("convert", "-", "-thumbnail", "128x128", "-quality", "60", ctx.TempOutputPath)
	cmd.Stdin = fhandle
	return runAudioCommand(cmd, ctx)
}

func produceAudioThumbnailFromPhysicalLocation(physLoc, artFile string, ctx *NailerContext) error {
	fpath := path.Join(physLoc, artFile)
	cmd := exec.Command("convert", fpath, "-thumbnail", "128x128", "-quality", "60", ctx.TempOutputPath)
	return runAudioCommand(cmd, ctx)
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

var _ Nailer = &AudioNailer{}
