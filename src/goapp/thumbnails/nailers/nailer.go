package nailers

import (
	"catears/ffs/lib/autofolder"
	"catears/ffs/lib/disks"
	"catears/ffs/lib/ffslog"
	"catears/ffs/lib/functional"
	"io/fs"
	"os"
	"path"
	"slices"
)

type NailerContext struct {
	Disk            disks.Disk
	FilePath        string
	TempOutputPath  string
	TargetDirectory autofolder.AutoFolder
	OutputName      string
	PromoteToParent bool
}

var logger = ffslog.FindOrCreateLogger("Thumbnail")

func (ctx *NailerContext) Success() error {
	// TODO: This algorithm is inspired from the old `deno` code, but it fails
	// to consider when a folder changes files, which can lead to stale thumbnails.
	// We need a good way to display thumbnails for directories that can handle these types of updates
	outputFolder, err := ctx.TargetDirectory.Get()
	if err != nil {
		return err
	}

	outputPath := path.Join(outputFolder, ctx.OutputName)
	err = os.Rename(ctx.TempOutputPath, outputPath)
	if err != nil {
		return err
	}

	logger.Debugf("Created thumbnail for %s", path.Base(ctx.FilePath))
	entries, err := fs.ReadDir(ctx.Disk.Fs(), path.Dir(ctx.FilePath))
	if err != nil {
		return err
	}

	names := functional.Map(func(entry fs.DirEntry) string { return entry.Name() }, entries)
	videoFiles := functional.Filter(isVideoFile, names)
	imageFiles := functional.Filter(isImageFile, names)
	audioFiles := functional.Filter(isAudioFile, names)
	if len(videoFiles) == 1 && videoFiles[0] == path.Base(ctx.FilePath) {
		ctx.PromoteToParent = true
	} else if len(imageFiles) == 1 && imageFiles[0] == path.Base(ctx.FilePath) {
		ctx.PromoteToParent = true
	} else if slices.Index(audioFiles, path.Base(ctx.FilePath)) != -1 {
		ctx.PromoteToParent = true
	}

	return nil
}

func NewNailerContext() *NailerContext {
	return &NailerContext{
		PromoteToParent: false,
	}
}

type Nailer interface {
	Generate(ctx *NailerContext) error
}
