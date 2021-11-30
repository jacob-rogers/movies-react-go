package models

import (
	"database/sql"
	"time"
)

// Generic type for model containing DB pool
type DBModel struct {
	DB      *sql.DB
	Queries Queries
}

// Models is the wrapper for database
type Models struct {
	DB DBModel
}

// NewModels returns models with DB pool
func NewModels(db *sql.DB) Models {
	return Models{
		DB: DBModel{
			DB:      db,
			Queries: prepareQueries(),
		},
	}
}

// Movie type describes Movie's meta information fields
type Movie struct {
	ID          int            `json:"id"`
	Title       string         `json:"title"`
	Description string         `json:"description"`
	Year        int            `json:"year"`
	ReleaseDate time.Time      `json:"release_date"`
	Runtime     int            `json:"runtime"`
	Rating      int            `json:"rating"`
	MPAARating  string         `json:"mpaa_rating"`
	CreatedAt   time.Time      `json:"created_at"`
	UpdatedAt   time.Time      `json:"updated_at"`
	MovieGenre  map[int]string `json:"genres"`
}

// Genre type describes Genre's meta information fields
type Genre struct {
	ID        int       `json:"id"`
	GenreName string    `json:"genre_name"`
	CreatedAt time.Time `json:"-"`
	UpdatedAt time.Time `json:"-"`
}

// MovieGenre type describes a link between Movie and its Genre
type MovieGenre struct {
	ID        int       `json:"-"`
	MovieID   int       `json:"-"`
	GenreID   int       `json:"-"`
	Genre     Genre     `json:"genre"`
	CreatedAt time.Time `json:"-"`
	UpdatedAt time.Time `json:"-"`
}

// User type describes User's information
type User struct {
	ID       int
	Email    string
	Password string
}
