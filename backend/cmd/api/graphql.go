package main

import (
	"backend/models"
	"encoding/json"
	"fmt"
	"io"
	"log"
	"net/http"
	"strings"

	gql "github.com/graphql-go/graphql"
)

var movies []*models.Movie

var fields = gql.Fields{
	"movie": &gql.Field{
		Type:        movieType,
		Description: "Get movie by id",
		Args: gql.FieldConfigArgument{
			"id": &gql.ArgumentConfig{
				Type: gql.Int,
			},
		},
		Resolve: func(p gql.ResolveParams) (interface{}, error) {
			id, ok := p.Args["id"].(int)
			if ok {
				for _, movie := range movies {
					if movie.ID == id {
						return movie, nil
					}
				}
			}
			return nil, nil
		},
	},

	"list": &gql.Field{
		Type:        gql.NewList(movieType),
		Description: "Get all movies",
		Resolve: func(p gql.ResolveParams) (interface{}, error) {
			return movies, nil
		},
	},

	"search": &gql.Field{
		Type:        gql.NewList(movieType),
		Description: "Search movies by title",
		Args: gql.FieldConfigArgument{
			"titleContains": &gql.ArgumentConfig{
				Type: gql.String,
			},
		},
		Resolve: func(p gql.ResolveParams) (interface{}, error) {
			var theList []*models.Movie
			search, ok := p.Args["titleContains"].(string)
			if ok {
				for _, currentMovie := range movies {
					if strings.Contains(strings.ToLower(currentMovie.Title), strings.ToLower(search)) {
						log.Println("Found one")
						theList = append(theList, currentMovie)
					}
				}
			}

			return theList, nil
		},
	},
}

var movieType = gql.NewObject(
	gql.ObjectConfig{
		Name: "Movie",
		Fields: gql.Fields{
			"id": &gql.Field{
				Type: gql.Int,
			},
			"title": &gql.Field{
				Type: gql.String,
			},
			"description": &gql.Field{
				Type: gql.String,
			},
			"year": &gql.Field{
				Type: gql.Int,
			},
			"release_date": &gql.Field{
				Type: gql.DateTime,
			},
			"runtime": &gql.Field{
				Type: gql.Int,
			},
			"rating": &gql.Field{
				Type: gql.Int,
			},
			"mpaa_rating": &gql.Field{
				Type: gql.String,
			},
			"created_at": &gql.Field{
				Type: gql.DateTime,
			},
			"updated_at": &gql.Field{
				Type: gql.DateTime,
			},
		},
	},
)

func (app *application) moviesGraphQL(w http.ResponseWriter, r *http.Request) {
	movies, _ = app.models.DB.All()

	q, _ := io.ReadAll(r.Body)
	query := string(q)

	app.logger.Println(query)

	rootQuery := gql.ObjectConfig{Name: "RootQuery", Fields: fields}
	schemaConfig := gql.SchemaConfig{Query: gql.NewObject(rootQuery)}
	schema, err := gql.NewSchema(schemaConfig)
	if err != nil {
		app.errorJSON(w, fmt.Errorf("failed to create GraphQL schema: %+v", err))
		app.logger.Println(err)
		return
	}

	params := gql.Params{Schema: schema, RequestString: query}
	resp := gql.Do(params)
	if len(resp.Errors) > 0 {
		app.errorJSON(w, fmt.Errorf("GraphQL query request failed: %+v", resp.Errors))
	}

	app.logger.SetPrefix("[graphql]")
	app.logger.Println(resp.Data)
	j, _ := json.MarshalIndent(resp, "", "\t")
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	w.Write(j)

}
