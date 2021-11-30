import React, { Component, Fragment } from "react";
import { Link } from "react-router-dom";

export default class Admin extends Component {
  state = {
    movies: [],
    isLoaded: false,
    error: null,
  };

  componentDidMount() {
    // Redirect to login page if no JWT provided
    if (!this.props.jwt) {
      this.props.history.push({ pathname: "/login" });
      return;
    }

    fetch(`${process.env.REACT_APP_API_URL}/v1/movies`)
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
        }, (err) => {
          this.setState({
            isLoaded: true,
            error: err,
          })
        });
      });
  }

  render() {
    const { movies, isLoaded, error } = this.state;

    if (error) return <div>Error: {error.message}</div>;

    if (!isLoaded) {
      return <p>Loading ...</p>
    }

    return (
      <Fragment>
        <h2>Manage Catalogue</h2>
        <div className="list-group">
          {movies.map((movie) => (
            <Link
              key={movie.id}
              className="list-group-item list-group-item-action"
              to={`/admin/movie/${movie.id}`}>
              {movie.title}
            </Link>
          ))}
        </div>
      </Fragment>
    );
  }
}
