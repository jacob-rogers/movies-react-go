package main

import (
	"backend/models"
	"encoding/json"
	"errors"
	"fmt"
	"io/ioutil"
	"net/http"
	"strings"
	"time"

	"github.com/pascaldekloe/jwt"
	"golang.org/x/crypto/bcrypt"
)

// DB_USERS_MOCKUP_FILE is a path to file with users mockup data
const DB_USERS_MOCKUP_FILE = "./data/user/users.json"

// Credentials type constructs a map of user credentials to be checked
// in signin API handler
type Credentials struct {
	Username string `json:"email"`
	Password string `json:"password"`
}

// Signin API handler validates user credentials and produces a JWT token for
// token-based authentication of protected APIs and services.
func (app *application) Signin(w http.ResponseWriter, r *http.Request) {
	var creds Credentials

	err := json.NewDecoder(r.Body).Decode(&creds)
	if err != nil {
		app.errorJSON(w, errors.New("unauthorized: cannot read user credentials"))
		return
	}

	//
	// Get user from mockup data / from DB here ...
	//

	// Mockup user from test file
	// TODO: should be transferred to db managing
	bu, err := ioutil.ReadFile(DB_USERS_MOCKUP_FILE)
	if err != nil {
		app.errorJSON(
			w,
			fmt.Errorf("unauthorized: unable to read users from file db: %+v", err),
		)
		return
	}

	var dbUsers []models.User
	err = json.Unmarshal(bu, &dbUsers)
	if err != nil {
		app.errorJSON(
			w,
			fmt.Errorf("unauthorized: unable to read users from file db: %+v", err),
		)
		return
	}

	var foundUser models.User
	for _, dbUser := range dbUsers {
		if dbUser.Email == creds.Username {
			foundUser = dbUser
		}
	}

	// Passwords inside users file db should also be encrypted
	hashedPassword := foundUser.Password

	// Main password check - comparing client password hash with db user hash
	err = bcrypt.CompareHashAndPassword([]byte(hashedPassword), []byte(creds.Password))
	if err != nil {
		app.errorJSON(w, errors.New("unauthorized: password is incorrect"))
		return
	}

	// Constructing JWT claims. Token expiration time: 24 hours.
	// Subject is user ID, not email. Issuers and audiences are provided
	// in app's config
	var claims jwt.Claims
	claims.Subject = fmt.Sprint(foundUser.ID)
	claims.Issued = jwt.NewNumericTime(time.Now())
	claims.NotBefore = jwt.NewNumericTime(time.Now())
	claims.Expires = jwt.NewNumericTime(time.Now().Add(24 * time.Hour))
	claims.Issuer = app.config.jwt.issuer
	claims.Audiences = strings.Split(app.config.jwt.audiences, ",")

	// Sign claims by using JWT secret and get the new JWT in bytes
	jwtBytes, err := claims.HMACSign(jwt.HS256, []byte(app.config.jwt.secret))
	if err != nil {
		app.errorJSON(w, errors.New("unauthorized: error in signing a new JWT"))
		return
	}

	// Client response should contain JWT as string
	err = app.writeJSON(w, http.StatusOK, string(jwtBytes), "response")
	if err != nil {
		app.errorJSON(w, err)
		return
	}

}
