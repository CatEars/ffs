package router

import (
	"encoding/json"
	"net/http"
)

func JsonResponse(w http.ResponseWriter, v any) {
	marshalled, err := json.Marshal(v)
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		return
	}

	w.Header().Add("Content-Type", "application/json")
	w.Write(marshalled)
}
