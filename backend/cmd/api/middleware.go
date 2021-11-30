package main

import (
	"context"
	"errors"
	"net/http"
	"strconv"
	"strings"
	"time"

	"github.com/julienschmidt/httprouter"
	"github.com/pascaldekloe/jwt"
)

// wrap middleware makes a chain with underlying http handler, providing
// httprouter request params into context. It may contain single or multiple
// chaining http handlers controled by alice library
// (see https://github.com/justinas/alice#usage)
func (app *application) wrap(next http.Handler) httprouter.Handle {
	return func(w http.ResponseWriter, r *http.Request, ps httprouter.Params) {
		ctx := context.WithValue(r.Context(), "params", ps)
		next.ServeHTTP(w, r.WithContext(ctx))
	}
}

// enableCORS middleware function providing set of HTTP headers for appropriate
// cross-origin requests routing. It may be updated to correspond to strict
// rules in production environment when no proxies configured by default.
func (app *application) enableCORS(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Access-Control-Allow-Origin", "*")
		w.Header().Set("Access-Control-Allow-Headers", "Content-Type,Authorization")

		next.ServeHTTP(w, r)
	})
}

// validateToken middleware function works with Authorization HTTP header to
// permit calling protected API's if valid JSON web token (JWT)
// provided by user.
func (app *application) validateToken(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Add("Vary", "Authorization")

		authHeader := r.Header.Get("Authorization")

		if authHeader == "" {
			// could set an anonymous user
		}

		// Only permit if auth header is of 2 string parts.
		headerParts := strings.Split(authHeader, " ")
		if len(headerParts) != 2 {
			app.errorJSON(w, errors.New("invalid auth header"))
			return
		}

		// Only permit auth header is of Bearer type
		if headerParts[0] != "Bearer" {
			app.errorJSON(w, errors.New("unauthorized: no Bearer"))
			return
		}

		// Parsing JWT with known secret from app's configuration
		token := headerParts[1]
		claims, err := jwt.HMACCheck([]byte(token), []byte(app.config.jwt.secret))
		if err != nil {
			app.errorJSON(w, errors.New("unauthorized: failed HMAC check"), http.StatusForbidden)
			return
		}

		// Token may be expired
		if !claims.Valid(time.Now()) {
			if err != nil {
				app.errorJSON(w, errors.New("unauthorized: token exprired"), http.StatusForbidden)
				return
			}
		}

		// Current audience is provided from config, this is a temporary solution.
		// Should match the list of accepted audiences.
		currentAudience := strings.SplitN(app.config.jwt.audiences, ",", 2)[0]
		if !claims.AcceptAudience(currentAudience) {
			if err != nil {
				app.errorJSON(w, errors.New("unauthorized: invalid audience"), http.StatusForbidden)
				return
			}
		}

		// Current issuer ID is provided from config, this is a temporary solution.
		// Should match the issuer from server enviroment.
		if claims.Issuer != app.config.jwt.issuer {
			if err != nil {
				app.errorJSON(w, errors.New("unauthorized: invalid issuer"), http.StatusForbidden)
				return
			}
		}

		// Subject finally is our user ID, note it might not match user's email.
		// Extract returning value if needed for contexting or any other purposes.
		_, err = strconv.ParseInt(claims.Subject, 10, 64)
		if err != nil {
			app.errorJSON(w, errors.New("unauthorized"), http.StatusForbidden)
			return
		}

		next.ServeHTTP(w, r)
	})
}
