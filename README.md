# Movies library web app build on React & Golang

[![Release](https://img.shields.io/github/v/release/jacob-rogers/movies-react-go?include_prereleases&sort=semver)](https://github.com/jacob-rogers/movies-react-go/releases/latest)

This repo contains the source code for web application with library of movies, created during the study of [React and Go services course on Udemy platform](https://www.udemy.com/course/working-with-react-and-go-golang/).

**Disclaimer: This app is not production-ready yet.**

## Features

- React web application styled with Bootstrap CSS and created by using create-react-app tooling set.

- Classic components, functions and lifecycle methods (used from v0.0.1).

- React Router v5.3.0 used for client-side (browser) routing.

- Golang web service as backend for all endpoints. Go version 1.17 used, dependency packages are installed as modules.

- Explicit route matching with [httprouter](https://github.com/julienschmidt/httprouter) mux HTTP request router.

- [alice](github.com/justinas/alice) package for chaining multiple HTTP middleware

- REST API architecture of interaction between frontend and backend. Standard CRUD operations used.

## Prerequisites

- For local environment:

  - Node.js >= v14

  - Yarn package manager for Node.js (<https://classic.yarnpkg.com/lang/en/docs/install>)

  - Go >= 1.17 (might work on versions down to 1.13, but not tested)

  - Web browser

  - Git (to clone repo using git commands)

## Local installation & run

Just clone this repo:

```sh
git clone https://github.com/jacob-rogers/movies-react-go
cd movies-react-go
```

### Install packages and start React app

```sh
cd frontend
yarn
yarn start
```

Keep the terminal being opened, webpack dev server will refresh the app's page in browser automatically when changes made.

### Install packages and start Go app

For local installation you probably should take care about environment variables for such things as JWT secret or DSN for PostgreSQL connection.

Create `backend/.env` file from example

```sh
cp backend/.env.example backend/.env
```

and substitute all values with actual for your environment.

Env file `backend/.env` will automatically be used in backend's runtime.

> NOTE: To override env file path, if located in different place, you need to change a value of `DEFAULT_ENV_FILE_PATH` constant in `backend/cmd/api/main.go`.

Finally, in separate terminal session run:

```sh
cd backend
go run cmd/api/*.go
```

## Usage

When local environment is using, go to <http://localhost:3000/> in web browser.

Server API v1 is available by default at <http://localhost:4000/v1/>

If you override the port by setting up PORT env variable, it should be placed as server port.

## Authentication

App uses basic authentication for signin function and JWT authentication for protected APIs.

The simplest option of user authentication store in local environment is db file `backend/data/user/users.json`.

**WARNING: This is only for local development or testing, do not use when deploying services anywhere else!**

Create the file above in your local deployment by running:

```sh
cp backend/data/user/users.example.json backend/data/user/users.json
```

The content of `users.json` file is the list of valid users with hashed passwords included. Use `bcrypt` tool to make your user's password encrypted before putting it into db file.
