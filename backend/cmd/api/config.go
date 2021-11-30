package main

const (
	version = "0.0.1"
)

type config struct {
	port int
	env  string
	db   struct {
		dsn string
	}
	jwt struct {
		audiences string
		issuer    string
		secret    string
	}
}
