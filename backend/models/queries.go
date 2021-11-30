package models

type Queries struct {
	GetMovie           string
	GetGenresByMovie   string
	GetAllMovies       string
	GetAllMoviesClause string
	GetAllGenres       string
	InsertMovie        string
	UpdateMovie        string
	DeleteMovie        string
}

func prepareQueries() Queries {
	var queries Queries

	queries.GetMovie = `
		SELECT
			id, title, description, year, release_date, runtime, rating,
			mpaa_rating, created_at, updated_at
		FROM
			movies
		WHERE
			id = $1
	`

	queries.GetGenresByMovie = `
		SELECT
			mg.id, mg.movie_id, mg.genre_id, g.genre_name
		FROM
			movies_genres mg
			LEFT JOIN genres g ON (g.id = mg.genre_id)
		WHERE
			mg.movie_id = $1
	`

	queries.GetAllMovies = `
		SELECT
			id, title, description, year, release_date, runtime, rating,
			mpaa_rating, created_at, updated_at
		FROM
			movies 
		%s
		ORDER BY
			title
	`

	queries.GetAllMoviesClause = `
		WHERE id
		IN (SELECT movie_id FROM movies_genres WHERE genre_id = %d)
	`

	queries.GetAllGenres = `
		SELECT
			id, genre_name, created_at, updated_at
		FROM
			genres
		ORDER BY
			genre_name
	`

	queries.InsertMovie = `
		INSERT INTO
			movies
		(title, description, year, release_date, runtime, rating, mpaa_rating, created_at, updated_at)
		values
		($1, $2, $3, $4, $5, $6, $7, $8, $9)
	`

	queries.UpdateMovie = `
		UPDATE
			movies
		SET
			title = $1, description = $2, year = $3,
			release_date = $4, runtime = $5, rating = $6,
			mpaa_rating = $7, updated_at = $8
		WHERE
			id = $9
	`

	queries.DeleteMovie = `
		DELETE FROM
			movies
		WHERE
			id = $1
	`

	return queries
}
