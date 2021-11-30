package main

import (
	"net/http"

	"github.com/julienschmidt/httprouter"
	"github.com/justinas/alice"
)

// routes function provides an HTTP router and its set of handlers
// for all methods, endpoints and middleware.
func (app *application) routes() http.Handler {
	// New HTTP router
	router := httprouter.New()

	// New chain with token validation middleware for protected APIs
	secure := alice.New(app.validateToken)

	// App status handler
	router.HandlerFunc(http.MethodGet, "/status", app.statusHandler)

	// GraphQL handlers
	router.HandlerFunc(http.MethodPost, "/v1/graphql", app.moviesGraphQL)

	// User signin handler
	router.HandlerFunc(http.MethodPost, "/v1/signin", app.Signin)

	// Movies collection handlers
	router.HandlerFunc(http.MethodGet, "/v1/movie/:id", app.getOneMovie)
	router.HandlerFunc(http.MethodGet, "/v1/movies", app.getAllMovies)
	router.HandlerFunc(http.MethodGet, "/v1/movies/:genre_id", app.getAllMoviesByGenre)
	router.POST("/v1/admin/editmovie", app.wrap(secure.ThenFunc(app.editMovie)))
	router.GET("/v1/admin/deletemovie/:id", app.wrap(secure.ThenFunc(app.deleteMovie)))

	// Genres collection handlers
	router.HandlerFunc(http.MethodGet, "/v1/genres", app.getAllGenres)

	// CORS middleware is enabled by default for all routes
	return app.enableCORS(router)
}
