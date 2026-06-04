package send

import (
	"archive/tar"
	"compress/gzip"
	"fmt"
	"io"
	"io/fs"
	"net/http"
	"path"
)

func setDownloadedFilename(w http.ResponseWriter, fname string) {
	w.Header().Add("Content-Disposition", fmt.Sprintf("attachment; filename=\"%s\"", fname))
}

func sendSinglePath(w http.ResponseWriter, r *http.Request, root fs.FS, filePath string) error {
	stat, err := fs.Stat(root, filePath)
	if err != nil {
		return err
	}

	if stat.IsDir() {
		setDownloadedFilename(w, path.Base(filePath)+".tar.gz")
		directoryToSend, err := fs.Sub(root, filePath)
		if err != nil {
			return err
		}

		w.Header().Add("Content-Type", "application/gzip")

		gzipped := gzip.NewWriter(w)
		defer gzipped.Close()
		archive := tar.NewWriter(gzipped)
		defer archive.Close()
		err = archive.AddFS(directoryToSend)
		if err != nil {
			return err
		}

	} else if stat.Mode().IsRegular() {
		setDownloadedFilename(w, path.Base(filePath))
		http.ServeFileFS(w, r, root, filePath)
	} else {
		w.WriteHeader(http.StatusBadRequest)
	}

	return nil
}

func sendAsArchive(w http.ResponseWriter, root fs.FS, filePaths []string) error {
	stat, err := fs.Stat(root, ".")
	if err != nil {
		return err
	}

	name := stat.Name()
	setDownloadedFilename(w, name+".tar.gz")
	w.Header().Add("Content-Type", "application/gzip")

	archive := tar.NewWriter(w)
	defer archive.Close()

	for _, fpath := range filePaths {
		stat, err := fs.Stat(root, fpath)
		if err != nil {
			return err
		}

		hdr := &tar.Header{
			Name:    fpath,
			Size:    stat.Size(),
			Mode:    int64(stat.Mode()),
			ModTime: stat.ModTime(),
		}
		err = archive.WriteHeader(hdr)
		if err != nil {
			return err
		}

		f, err := root.Open(fpath)
		if err != nil {
			return err
		}
		defer f.Close()

		_, err = io.Copy(w, f)
		if err != nil {
			return err
		}
	}

	return nil
}

func SendFilesSmartly(w http.ResponseWriter, r *http.Request, root fs.FS, filePaths []string) error {
	if len(filePaths) == 0 {
		w.WriteHeader(http.StatusBadRequest)
		return nil
	}

	if len(filePaths) == 1 {
		return sendSinglePath(w, r, root, filePaths[0])
	} else {
		return sendAsArchive(w, root, filePaths)
	}
}
