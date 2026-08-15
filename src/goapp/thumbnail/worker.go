package thumbnail

import (
	exetester "catears/ffs/lib/exe-tester"
	"log"
	"os"
	"path/filepath"
	"regexp"
)

const (
	quitChannel = iota
)

type thumbnailWorker struct {
	signalChannel chan int
	root string
}

type ThumbnailWorker interface {
	Start() error
	Stop() error
}

var ffmpegTester = exetester.New("ffmpeg", []string{"-version"}, regexp.MustCompile(`ffmpeg version \d\.\d\.\d`))
var imageMagickTester = exetester.New("convert", []string{"-version"}, regexp.MustCompile(`Version: ImageMagick \d\.\d\.\d`))

type quitEarlyError struct {

}
func processSingleFileEntry(path string, dir os.Entry) error {
	return nil
}

func (worker *thumbnailWorker) runThumbnailProcess() {
	for {
		select {
		case <-worker.signalChannel:
			return
		default:
			err := filepath.WalkDir(worker.root, func(path string, dir os.DirEntry, err error) error {
				if err != nil {
					return err
				}
				select {
				case <- worker.signalChannel:
					return quitEarlyError
				default:
					break
				}
				return processSingleFileEntry(path, dir)
			})
			if err != nil {
				log.Printf("%s\n", err)
			}
			return
		}
	}
}

func (worker *thumbnailWorker) Start() error {
	go worker.runThumbnailProcess()
	return nil
}

func (worker *thumbnailWorker) Stop() error {
	worker.signalChannel <- quitChannel
	return nil
}

func NewWorker(root string) ThumbnailWorker {
	return &thumbnailWorker{
		signalChannel: make(chan int),
	}
}
