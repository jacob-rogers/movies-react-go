package main

import (
	"backend/models"
	"context"
	"database/sql"
	"flag"
	"fmt"
	"log"
	"net/http"
	"os"
	"time"

	"github.com/joho/godotenv"
	_ "github.com/lib/pq"
)

// Determines the default location of env vars file for execution
const DEFAULT_ENV_FILE_PATH = ".env"

// Store type for different types of application configuration data
// (logger, config, database pools, etc.)
type application struct {
	config config
	logger *log.Logger
	models models.Models
}

func main() {
	// Logger
	logger := log.New(os.Stdout, "", log.Ldate|log.Ltime)

	// Application configuration bindings
	var cfg config

	// Read env file's content from default location, if needed to get from
	// another one place - put it in DEFAULT_ENV_FILE_PATH constant
	// This function call will populate environment variables of the
	// current runtime, to override some of them:
	//   1. Call main function with explicitly specified env vars;
	//   2. Or just replace their values right in env file.
	err := godotenv.Load(DEFAULT_ENV_FILE_PATH)
	if err != nil {
		logger.Fatal("Error loading .env file")
	}

	// Take all flags into our config
	cfg.readAllFlags()

	// Open a new database connection
	db, err := openDB(cfg)
	if err != nil {
		logger.Fatal(err)
	}
	defer db.Close()

	// Creating a new application receiver instance
	// [application] type becomes a receiver for lots of other modules & packages
	app := &application{
		config: cfg,
		logger: logger,
		models: models.NewModels(db),
	}

	// HTTP server configuration
	srv := &http.Server{
		Addr:         fmt.Sprintf(":%d", cfg.port),
		Handler:      app.routes(),
		IdleTimeout:  time.Minute,
		ReadTimeout:  10 * time.Second,
		WriteTimeout: 30 * time.Second,
	}

	logger.Println("Starting server on port", cfg.port)

	// Starting a new HTTP server listener ...
	if err := srv.ListenAndServe(); err != nil {
		logger.Println(err)
	}

}

// This function makes a new DB context and PostgreSQL driver connection
func openDB(cfg config) (*sql.DB, error) {
	db, err := sql.Open("postgres", cfg.db.dsn)
	if err != nil {
		return nil, err
	}

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	err = db.PingContext(ctx)
	if err != nil {
		return nil, err
	}

	return db, nil
}

// readAllFlags function is sequentially reading sensible command-line flags,
// required for context of app's config. Default values are substituted by env
// vars if provided, or by typed resolvation, using lookupEnv*() functions.
func (cfg *config) readAllFlags() {
	flag.IntVar(
		&cfg.port,
		"port",
		lookupEnvInt("PORT", 4000),
		"Server port to listen on",
	)

	flag.StringVar(
		&cfg.env,
		"env",
		lookupEnv("APP_ENV", "development"),
		"Application environment (development|production)",
	)

	flag.StringVar(
		&cfg.db.dsn,
		"dsn",
		lookupEnv("DSN", ""),
		"PostgreSQL connection string",
	)

	flag.StringVar(
		&cfg.jwt.audiences,
		"jwt-aud",
		lookupEnv("JWT_AUD", ""),
		"List of JWT audiences, separated by comma",
	)

	flag.StringVar(
		&cfg.jwt.issuer,
		"jwt-iss",
		lookupEnv("JWT_ISS", ""),
		"JWT issuer ID",
	)

	flag.StringVar(
		&cfg.jwt.secret,
		"jwt-secret",
		lookupEnv("JWT_SECRET", ""),
		"JWT secret",
	)

	flag.Parse()
}
