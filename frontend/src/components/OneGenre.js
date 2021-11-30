import React, { Component, Fragment } from 'react'
import { Link } from 'react-router-dom';

export default class OneGenre extends Component {
  state = {
    movies: [],
    isLoaded: false,
    error: null,
    genreName: "",
  };

  componentDidMount() {
    fetch("http://localhost:4000/v1/movies/" + this.props.match.params.id)
      .then((response) => {
        if (response.status !== 200) {
          const err = Error;
          err.message = "Invalid response code: " + response.status;
          this.setState({ error: err });
        }

        return response.json();
      })
      .then((json) => {
        this.setState({
          movies: json.movies,
          isLoaded: true,
          genreName: this.props.location.genreName,
        }, (err) => {
          this.setState({
            isLoaded: true,
            error: err,
          })
        });
      });
  }

  render() {
    let { movies, isLoaded, error, genreName } = this.state;

    if (!movies) movies = [];

    if (error) return <div>Error: {error.message}</div>;

    if (!isLoaded) {
      return <p>Loading ...</p>
    }

    return (
      <Fragment>
        <h2>Genre: {genreName}</h2>

        <div className="list-group">
          {movies.map((movie) => (
            <Link
              key={movie.id}
              className="list-group-item list-group-item-action"
              to={`/movies/${movie.id}`}>
              {movie.title}
            </Link>
          ))}
        </div>
      </Fragment>
    );
  }
}
