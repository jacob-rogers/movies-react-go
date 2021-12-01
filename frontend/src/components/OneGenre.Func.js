import React, { useEffect, useState, Fragment } from "react";
import { Link } from "react-router-dom";

import Loading from "./Loading";

export default function OneGenreFunc(props) {
  const [movies, setMovies] = useState([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState(null);
  const [genreName, setGenreName] = useState("");

  useEffect(() => {
    fetch(`${process.env.REACT_APP_API_URL}/v1/movies/` + props.match.params.id)
      .then((response) => {
        if (response.status !== 200) {
          setError("Invalid response code: " + response.status);
        } else {
          setError(null);
        }

        return response.json();
      })
      .then((data) => {
        if (!data.movies) {
          setMovies([]);
        } else {
          setMovies(data.movies);
        }
        setGenreName(props.location.genreName);
        // Just to simulate network/operational latencies
        setTimeout(() => {
          setIsLoaded(true);
        }, 200);
      });
  }, [props.match.params.id, props.location.genreName]);


  if (error) return <div>Error: {error.message}</div>;
  if (!isLoaded) return <Loading />;

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
