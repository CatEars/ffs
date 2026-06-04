package microphone

import (
	"html/template"
	"io/fs"
	"strings"
)

type Microphone struct {
	Views       map[string]*template.Template
	StaticFiles fs.FS
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

func convertFilesToTemplates(contentRoot fs.FS, templateBase *template.Template, paths []string) (map[string]*template.Template, error) {
	result := make(map[string]*template.Template)

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

func New(contentRoot fs.FS) (*Microphone, error) {
	staticFolder, err := fs.Sub(contentRoot, "static")
	if err != nil {
		return nil, err
	}
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

	return &Microphone{
		Views:       views,
		StaticFiles: staticFolder,
	}, nil
}
