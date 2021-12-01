import React, { useEffect, useState, Fragment } from "react";
import { Link } from "react-router-dom";

export default function MoviesFunc(props) {
  const [movies, setMovies] = useState([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch(`${process.env.REACT_APP_API_URL}/v1/movies`)
      .then((response) => {
        if (response.status !== 200) {
          setError("Invalid response code: " + response.status);
        } else {
          setError(null);
        }

        return response.json();
      })
      .then((data) => {
        setMovies(data.movies);
        setIsLoaded(true);
      });
  }, []);

  if (error) return <div>Error: {error.message}</div>;
  if (!isLoaded) return <p>Loading ...</p>;

  return (
    <Fragment>
      <h2>Choose a movie</h2>
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