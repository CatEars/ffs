package microphone

import (
	"html/template"
	"io/fs"
	"net/http"
	"strings"
)

type viewMapping map[string]*template.Template

type Microphone struct {
	contentRoot  fs.FS
	Views        viewMapping
	StaticFiles  fs.FS
	AlwaysReload bool
}

func findAllHtmlFiles(contentRoot fs.FS) ([]string, error) {
	files := []string{}
	err := fs.WalkDir(contentRoot, ".", func(path string, d fs.DirEntry, err error) error {
		if err != nil {
			return err
		}

		if strings.HasSuffix(path, ".html") && d.Type().IsRegular() {
			files = append(files, path)
		}

		return nil
	})

	if err != nil {
		return nil, err
	}

	return files, nil
}

func convertFilesToTemplates(contentRoot fs.FS, templateBase *template.Template, paths []string) (viewMapping, error) {
	result := make(viewMapping)

	for _, viewPath := range paths {
		canonicalPath := strings.Replace(viewPath, "index.html", "", 1)
		canonicalPath = strings.Replace(canonicalPath, ".html", "", 1)
		view, err := template.ParseFS(contentRoot, viewPath)
		if err != nil {
			return nil, err
		}
		copy := template.Must(templateBase.Clone())
		viewWithTemplates := template.Must(copy.AddParseTree(canonicalPath, view.Tree))
		result[canonicalPath] = viewWithTemplates
	}

	return result, nil
}

func readAll(contentRoot fs.FS) (viewMapping, error) {
	viewsFolder, err := fs.Sub(contentRoot, "views")
	if err != nil {
		return nil, err
	}
	viewFiles, err := findAllHtmlFiles(viewsFolder)
	if err != nil {
		return nil, err
	}
	internalTemplates, err := template.ParseFS(contentRoot, "templates/[^._]*")
	if err != nil {
		return nil, err
	}
	views, err := convertFilesToTemplates(viewsFolder, internalTemplates, viewFiles)
	if err != nil {
		return nil, err
	}
	return views, nil
}

func New(contentRoot fs.FS) (*Microphone, error) {
	staticFolder, err := fs.Sub(contentRoot, "static")
	if err != nil {
		return nil, err
	}

	views, err := readAll(contentRoot)
	if err != nil {
		return nil, err
	}

	return &Microphone{
		contentRoot:  contentRoot,
		Views:        views,
		StaticFiles:  staticFolder,
		AlwaysReload: false,
	}, nil
}

func (mcr *Microphone) ExecuteTemplate(w http.ResponseWriter, viewName string, data any) error {
	var views viewMapping
	if mcr.AlwaysReload {
		var err error
		views, err = readAll(mcr.contentRoot)
		if err != nil {
			return err
		}
	} else {
		views = mcr.Views
	}
	t, found := views[viewName]
	if !found {
		w.WriteHeader(http.StatusNotFound)
	} else {
		return t.ExecuteTemplate(w, viewName, data)
	}
	return nil
}
