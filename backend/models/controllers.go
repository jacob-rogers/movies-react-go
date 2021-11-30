package models

import (
	"context"
	"fmt"
	"time"
)

// Get controller returns one movie and error, if any
func (m *DBModel) Get(id int) (*Movie, error) {
	ctx, cancel := context.WithTimeout(context.Background(), 3*time.Second)
	defer cancel()

	// query := `
	// 	SELECT
	// 		id, title, description, year, release_date, runtime, rating,
	// 		mpaa_rating, created_at, updated_at
	// 	FROM
	// 		movies
	// 	WHERE
	// 		id = $1
	// `

	query := m.Queries.GetMovie

	row := m.DB.QueryRowContext(ctx, query, id)

	var movie Movie
	err := row.Scan(
		&movie.ID,
		&movie.Title,
		&movie.Description,
		&movie.Year,
		&movie.ReleaseDate,
		&movie.Runtime,
		&movie.Rating,
		&movie.MPAARating,
		&movie.CreatedAt,
		&movie.UpdatedAt,
	)
	if err != nil {
		return nil, err
	}

	// get the genres, if any
	// query = `
	// 	SELECT
	// 		mg.id, mg.movie_id, mg.genre_id, g.genre_name
	// 	FROM
	// 		movies_genres mg
	// 		LEFT JOIN genres g ON (g.id = mg.genre_id)
	// 	WHERE
	// 		mg.movie_id = $1
	// `

	genreQuery := m.Queries.GetGenresByMovie

	rows, _ := m.DB.QueryContext(ctx, genreQuery, id)
	defer rows.Close()

	genres := make(map[int]string)
	for rows.Next() {
		var mg MovieGenre
		if err := rows.Scan(
			&mg.ID,
			&mg.MovieID,
			&mg.GenreID,
			&mg.Genre.GenreName,
		); err != nil {
			return nil, err
		}

		genres[mg.ID] = mg.Genre.GenreName
	}

	movie.MovieGenre = genres

	return &movie, nil
}

// All returns all movies and error, if any
func (m *DBModel) All(genre ...int) ([]*Movie, error) {
	ctx, cancel := context.WithTimeout(context.Background(), 3*time.Second)
	defer cancel()

	where := ""
	if len(genre) > 0 {
		where = fmt.Sprintf(m.Queries.GetAllMoviesClause, genre[0])
	}

	// query := fmt.Sprintf(`
	// 	SELECT
	// 		id, title, description, year, release_date, runtime, rating,
	// 		mpaa_rating, created_at, updated_at
	// 	FROM
	// 		movies
	// 	%s
	// 	ORDER BY
	// 		title
	// `, where)

	query := fmt.Sprintf(m.Queries.GetAllMovies, where)

	rows, err := m.DB.QueryContext(ctx, query)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var movies []*Movie
	for rows.Next() {
		var movie Movie
		if err := rows.Scan(
			&movie.ID,
			&movie.Title,
			&movie.Description,
			&movie.Year,
			&movie.ReleaseDate,
			&movie.Runtime,
			&movie.Rating,
			&movie.MPAARating,
			&movie.CreatedAt,
			&movie.UpdatedAt,
		); err != nil {
			return nil, err
		}

		// get the genres, if any
		// genreQuery := `
		// 	SELECT
		// 		mg.id, mg.movie_id, mg.genre_id, g.genre_name
		// 	FROM
		// 		movies_genres mg
		// 		LEFT JOIN genres g ON (g.id = mg.genre_id)
		// 	WHERE
		// 		mg.movie_id = $1
		// `

		genreQuery := m.Queries.GetGenresByMovie

		genreRows, _ := m.DB.QueryContext(ctx, genreQuery, movie.ID)

		genres := make(map[int]string)
		for genreRows.Next() {
			var mg MovieGenre
			if err := genreRows.Scan(
				&mg.ID,
				&mg.MovieID,
				&mg.GenreID,
				&mg.Genre.GenreName,
			); err != nil {
				return nil, err
			}

			genres[mg.ID] = mg.Genre.GenreName
		}

		genreRows.Close()

		movie.MovieGenre = genres

		movies = append(movies, &movie)
	}

	return movies, nil
}

func (m *DBModel) GenresAll() ([]*Genre, error) {
	ctx, cancel := context.WithTimeout(context.Background(), 3*time.Second)
	defer cancel()

	// query := `
	// 	SELECT
	// 		id, genre_name, created_at, updated_at
	// 	FROM
	// 		genres
	// 	ORDER BY
	// 		genre_name
	// `

	query := m.Queries.GetAllGenres

	rows, err := m.DB.QueryContext(ctx, query)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var genres []*Genre
	for rows.Next() {
		var g Genre
		if err := rows.Scan(
			&g.ID,
			&g.GenreName,
			&g.CreatedAt,
			&g.UpdatedAt,
		); err != nil {
			return nil, err
		}

		genres = append(genres, &g)
	}

	return genres, nil
}

func (m *DBModel) InsertMovie(movie Movie) error {
	ctx, cancel := context.WithTimeout(context.Background(), 3*time.Second)
	defer cancel()

	// stmt := `
	// 	INSERT INTO
	// 		movies
	// 	(title, description, year, release_date, runtime, rating, mpaa_rating, created_at, updated_at)
	// 	values
	// 	($1, $2, $3, $4, $5, $6, $7, $8, $9)
	// `

	stmt := m.Queries.InsertMovie

	_, err := m.DB.ExecContext(ctx, stmt,
		movie.Title,
		movie.Description,
		movie.Year,
		movie.ReleaseDate,
		movie.Runtime,
		movie.Rating,
		movie.MPAARating,
		movie.CreatedAt,
		movie.UpdatedAt,
	)
	if err != nil {
		return err
	}

	return nil
}

func (m *DBModel) UpdateMovie(movie Movie) error {
	ctx, cancel := context.WithTimeout(context.Background(), 3*time.Second)
	defer cancel()

	// stmt := `
	// 	UPDATE
	// 		movies
	// 	SET
	// 		title = $1, description = $2, year = $3,
	// 		release_date = $4, runtime = $5, rating = $6,
	// 		mpaa_rating = $7, updated_at = $8
	// 	WHERE
	// 		id = $9
	// `

	stmt := m.Queries.UpdateMovie

	_, err := m.DB.ExecContext(ctx, stmt,
		movie.Title,
		movie.Description,
		movie.Year,
		movie.ReleaseDate,
		movie.Runtime,
		movie.Rating,
		movie.MPAARating,
		movie.UpdatedAt,
		movie.ID,
	)
	if err != nil {
		return err
	}

	return nil
}

func (m *DBModel) DeleteMovie(id int) error {
	ctx, cancel := context.WithTimeout(context.Background(), 3*time.Second)
	defer cancel()

	// stmt := `
	// 	DELETE FROM
	// 		movies
	// 	WHERE
	// 		id = $1
	// `

	stmt := m.Queries.DeleteMovie

	_, err := m.DB.ExecContext(ctx, stmt, id)
	if err != nil {
		return err
	}

	return nil
}
