package main

import (
	"encoding/json"
	"net/http"
	"os"
	"strconv"
)

// lookupEnv function returns env var or default value (if not set) as string.
func lookupEnv(key string, defaultValue ...string) string {
	if v, ok := os.LookupEnv(key); ok {
		return v
	}

	if len(defaultValue) > 0 {
		return defaultValue[0]
	}

	return ""
}

// lookupEnvInt function returns env var of integer type, passing from default
// value or, if not provided or incorrect format, returning zero (nil for int).
func lookupEnvInt(key string, defaultValue ...int) int {
	envStr, ok := os.LookupEnv(key)

	if ok {
		envInt, err := strconv.Atoi(envStr)
		if err != nil {
			if len(defaultValue) > 0 {
				return defaultValue[0]
			}

			return 0
		}

		return envInt
	}

	if len(defaultValue) > 0 {
		return defaultValue[0]
	}

	return 0
}

// writeJSON function wraps json data with appropriate status code into
// http response.
func (app *application) writeJSON(w http.ResponseWriter, status int, data interface{}, wrap ...string) error {
	var wrapper interface{}

	if len(wrap) > 0 {
		wrapper = make(map[string]interface{})
		wrapper.(map[string]interface{})[wrap[0]] = data
	} else {
		wrapper = data
	}

	js, err := json.Marshal(wrapper)
	if err != nil {
		return err
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	w.Write(js)

	return nil
}

// errorJSON function wraps error message and code into http response.
// Default status code: 400 Bad Request.
// Use status argument to provide different status code.
func (app *application) errorJSON(w http.ResponseWriter, err error, status ...int) {
	statusCode := http.StatusBadRequest

	if len(status) > 0 {
		statusCode = status[0]
	}

	type jsonError struct {
		StatusCode int    `json:"statusCode"`
		Message    string `json:"message"`
	}

	theError := jsonError{
		StatusCode: statusCode,
		Message:    err.Error(),
	}

	app.writeJSON(w, statusCode, theError, "error")
}
