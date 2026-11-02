package nailers

import (
	"catears/ffs/lib/autofolder"
	"catears/ffs/lib/disks"
	"catears/ffs/lib/ffslog"
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
	outputFolder, err := ctx.TargetDirectory.Get()
	if err != nil {
		return err
	}

	outputPath := path.Join(outputFolder, ctx.OutputName)
	err = os.Rename(ctx.TempOutputPath, outputPath)
	if err != nil {
		return err
	}

	logger.Infof("Created thumbnail for %s", path.Base(ctx.FilePath))
	entries, err := fs.ReadDir(ctx.Disk.Fs(), path.Dir(ctx.FilePath))
	if err != nil {
		return err
	}

	names := []string{}
	for _, entry := range entries {
		names = append(names, entry.Name())
	}
	// TODO: This algorithm is inspired from the old `deno` code, but it fails
	// to consider when a folder changes files, which can lead to stale thumbnails.
	// We need a good way to display thumbnails for directories that can handle these types of updates
	videoFiles := filterVideoFiles(names)
	imageFiles := filterImageFiles(names)
	audioFiles := filterAudioFiles(names)
	if len(videoFiles) == 1 && videoFiles[0] == path.Base(ctx.FilePath) {
		ctx.PromoteToParent = true
	} else if len(imageFiles) == 1 && imageFiles[0] == path.Base(ctx.FilePath) {
		ctx.PromoteToParent = true
	} else if slices.Index(audioFiles, path.Base(ctx.FilePath)) != -1 {
		ctx.PromoteToParent = true
	}

	return nil
}

// TODO: Break these similar functions out to `functional` golib as filter
func filterVideoFiles(names []string) []string {
	res := []string{}
	for _, entry := range names {
		if isVideoFile(entry) {
			res = append(res, entry)
		}
	}
	return res
}

func filterAudioFiles(names []string) []string {
	res := []string{}
	for _, entry := range names {
		if isAudioFile(entry) {
			res = append(res, entry)
		}
	}
	return res
}

func filterImageFiles(names []string) []string {
	res := []string{}
	for _, entry := range names {
		if isImageFile(entry) {
			res = append(res, entry)
		}
	}
	return res
}

func NewNailerContext() *NailerContext {
	return &NailerContext{
		PromoteToParent: false,
	}
}

type Nailer interface {
	Generate(ctx *NailerContext) error
}
