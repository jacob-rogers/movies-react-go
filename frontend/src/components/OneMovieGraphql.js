import React, { Component, Fragment } from "react";

export default class OneMovieGraphql extends Component {
  state = {
    movie: {},
    isLoaded: false,
    error: null,
  };

  componentDidMount() {
    const payload = `
    {
      movie(id: ${this.props.match.params.id}) {
        id
        title
        runtime
        year
        description
        release_date
        rating
        mpaa_rating
      }
    }`;

    const headers = new Headers();
    headers.append("Content-Type", "application/json");

    const requestOptions = {
      method: "POST",
      body: payload,
      headers,
    };

    fetch(`${process.env.REACT_APP_API_URL}/v1/graphql`, requestOptions)
      .then((response) => response.json())
      .then((data) => {
        this.setState({
          movie: data.data.movie,
          isLoaded: true,
        });
      });
  }

  render() {
    const { movie, isLoaded, error } = this.state;

    if (movie.genres) {
      movie.genres = Object.values(movie.genres);
    } else {
      movie.genres = [];
    }

    if (error) return <div>Error: {error.message}</div>;

    if (!isLoaded) {
      return <p>Loading ...</p>
    }

    return (
      <Fragment>
        <h2>Movie: {movie.title} ({movie.year})</h2>

        <div className="float-start">
          <small>Rating: {movie.mpaa_rating}</small>
        </div>
        <div className="float-end">
          {movie.genres.map((m, index) => (
            <span key={index} className="badge bg-secondary me-1">
              {m}
            </span>
          ))}
        </div>
        <div className="clearfix"></div>

        <hr />

        <table className="table table-compact table-striped">
          <tbody>
            <tr>
              <td><strong>Title:</strong></td>
              <td>{movie.title}</td>
            </tr>
            <tr>
              <td><strong>Description:</strong></td>
              <td>{movie.description}</td>
            </tr>
            <tr>
              <td><strong>Runtime:</strong></td>
              <td>{movie.runtime}</td>
            </tr>
          </tbody>
        </table>
      </Fragment>
    );
  }
}
