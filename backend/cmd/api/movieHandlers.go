package main

import (
	"backend/models"
	"encoding/json"
	"errors"
	"fmt"
	"net/http"
	"strconv"
	"time"

	"github.com/julienschmidt/httprouter"
)

// MoviePayload is a type for customized client payload deserialization into models.Movie object.
// May exclude some fields from models.Movie type which are not allowed to be
// changed or created by client.
type MoviePayload struct {
	ID          string `json:"id"`
	Title       string `json:"title"`
	Desription  string `json:"description"`
	Year        string `json:"year"`
	ReleaseDate string `json:"release_date"`
	Runtime     string `json:"runtime"`
	Rating      string `json:"rating"`
	MPAARating  string `json:"mpaa_rating"`
}

// jsonResp is a simple type for success client response payload serialization
// in no-content requests.
type jsonResp struct {
	OK      bool   `json:"ok"`
	Message string `json:"message"`
}

// getOneMovie API handler returns models.Movie object by its movie ID.
func (app *application) getOneMovie(w http.ResponseWriter, r *http.Request) {
	params := httprouter.ParamsFromContext(r.Context())

	id, err := strconv.Atoi(params.ByName("id"))
	if err != nil {
		app.logger.Println(errors.New("invalid ID parameter"))
		app.errorJSON(w, err)
		return
	}

	movie, err := app.models.DB.Get(id)
	if err != nil {
		app.errorJSON(w, fmt.Errorf("cannot get the movie from db with id %d due to error: %+v", id, err))
		return
	}

	err = app.writeJSON(w, http.StatusOK, movie, "movie")
	if err != nil {
		app.errorJSON(w, err)
		return
	}

}

// getAllMovies API handler returns all of []models.Movie objects found.
func (app *application) getAllMovies(w http.ResponseWriter, r *http.Request) {
	movies, err := app.models.DB.All()
	if err != nil {
		app.errorJSON(w, err)
		return
	}

	err = app.writeJSON(w, http.StatusOK, movies, "movies")
	if err != nil {
		app.errorJSON(w, err)
		return
	}

}

// getAllGenres API handler returns all of []models.Genre objects found.
func (app *application) getAllGenres(w http.ResponseWriter, r *http.Request) {
	genres, err := app.models.DB.GenresAll()
	if err != nil {
		app.errorJSON(w, err)
		return
	}

	err = app.writeJSON(w, http.StatusOK, genres, "genres")
	if err != nil {
		app.errorJSON(w, err)
		return
	}

}

// getAllMoviesByGenre API handler returns all of []models.Movie objects found
// filtered by provided genre ID
func (app *application) getAllMoviesByGenre(w http.ResponseWriter, r *http.Request) {
	params := httprouter.ParamsFromContext(r.Context())

	genreID, err := strconv.Atoi(params.ByName("genre_id"))
	if err != nil {
		app.errorJSON(w, err)
		return
	}

	movies, err := app.models.DB.All(genreID)
	if err != nil {
		app.errorJSON(w, err)
		return
	}

	if err := app.writeJSON(w, http.StatusOK, movies, "movies"); err != nil {
		app.errorJSON(w, err)
		return
	}

}

// deleteMovie API handler deletes selected movie from db and returns empty
// success response to user. NOTE: response status here is 200 OK.
func (app *application) deleteMovie(w http.ResponseWriter, r *http.Request) {
	params := httprouter.ParamsFromContext(r.Context())

	id, err := strconv.Atoi(params.ByName("id"))
	if err != nil {
		app.errorJSON(w, err)
		return
	}

	err = app.models.DB.DeleteMovie(id)
	if err != nil {
		app.errorJSON(w, err)
		return
	}

	ok := jsonResp{
		OK: true,
	}
	if err := app.writeJSON(w, http.StatusOK, ok, "response"); err != nil {
		app.errorJSON(w, err)
		return
	}

}

// editMovie API handler updates movie in db or creates a new one, depending on
// payload movie ID. Responds with 200 OK when movie is updated and with
// 201 Created when movie is created.
func (app *application) editMovie(w http.ResponseWriter, r *http.Request) {
	var payload MoviePayload

	err := json.NewDecoder(r.Body).Decode(&payload)
	if err != nil {
		app.errorJSON(w, err)
		return
	}

	var movie models.Movie

	if payload.ID != "0" {
		id, _ := strconv.Atoi(payload.ID)
		m, _ := app.models.DB.Get(id)
		movie = *m
		movie.UpdatedAt = time.Now()
	} else {
		movie.CreatedAt = time.Now()
	}

	movie.ID, _ = strconv.Atoi(payload.ID)
	movie.Title = payload.Title
	movie.Description = payload.Desription
	movie.ReleaseDate, _ = time.Parse("2006-01-02", payload.ReleaseDate)
	movie.Year = movie.ReleaseDate.Year()
	movie.Runtime, _ = strconv.Atoi(payload.Runtime)
	movie.Rating, _ = strconv.Atoi(payload.Rating)
	movie.MPAARating = payload.MPAARating
	movie.UpdatedAt = time.Now()

	ok := jsonResp{
		OK: true,
	}

	if movie.ID == 0 {
		err = app.models.DB.InsertMovie(movie)
		if err != nil {
			app.errorJSON(w, err)
			return
		}

		if err := app.writeJSON(w, http.StatusCreated, ok, "response"); err != nil {
			app.errorJSON(w, err)
			return
		}
	} else {
		err = app.models.DB.UpdateMovie(movie)
		if err != nil {
			app.errorJSON(w, err)
			return
		}

		if err := app.writeJSON(w, http.StatusOK, ok, "response"); err != nil {
			app.errorJSON(w, err)
			return
		}
	}

}

// TODO: searchMovies API handler -- no description so far
func (app *application) searchMovies(w http.ResponseWriter, r *http.Request) {

}
