import React, { Component, Fragment } from "react"
import { Link } from "react-router-dom";

export default class Genres extends Component {
  state = {
    genres: [],
    isLoaded: false,
    error: null,
  };

  componentDidMount() {
    fetch(`${process.env.REACT_APP_API_URL}/v1/genres`)
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
          genres: json.genres,
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
    const { genres, isLoaded, error } = this.state;

    if (error) return <div>Error: {error.message}</div>;

    if (!isLoaded) {
      return <p>Loading ...</p>
    }

    return (
      <Fragment>
        <h2>Genres</h2>
        <div className="list-group">
          {genres.map((genre) => (
            <Link
              key={genre.id}
              className="list-group-item list-group-item-action"
              to={{
                pathname: `/genres/${genre.id}`,
                genreName: genre.genre_name,
              }}>{genre.genre_name}</Link>
          ))}
        </div>
      </Fragment>
    );
  }
}
