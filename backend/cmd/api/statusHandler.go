package main

import (
	"encoding/json"
	"fmt"
	"net/http"
)

// AppStatus type describes environment and runtime status of the application.
type AppStatus struct {
	Status      string
	Environment string
	Version     string
}

// statusHandler API handler returns application status, version and environment
// environment name.
//
// May be useful as liveness / readiness probe API or in testing.
func (app *application) statusHandler(w http.ResponseWriter, r *http.Request) {
	currentStatus := AppStatus{
		Status:      "Available",
		Environment: app.config.env,
		Version:     version,
	}

	js, err := json.MarshalIndent(currentStatus, "", "\t")
	if err != nil {
		app.errorJSON(w, fmt.Errorf("error while getting app status: %+v", err))
		return
	}

	err = app.writeJSON(w, http.StatusOK, js, "status")
	if err != nil {
		app.errorJSON(
			w,
			fmt.Errorf("error while writing JSON output into response: %+v", err),
		)
		return
	}

}
