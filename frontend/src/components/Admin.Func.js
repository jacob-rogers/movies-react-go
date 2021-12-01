import React, { useEffect, useState, Fragment } from "react";
import { Link } from "react-router-dom";
import Loading from "./ui-components/Loading";

export default function EditMovieFunc(props) {
  const [movies, setMovies] = useState([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Redirect to login page if no JWT provided
    if (!props.jwt) {
      props.history.push({ pathname: "/login" });
      return;
    }

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
        // Just to simulate network/operational latencies
        setTimeout(() => {
          setIsLoaded(true);
        }, 500);
      });

  }, [
    props.history,
    props.jwt,
  ]);


  if (error) return <div>Error: {error.message}</div>;
  if (!isLoaded) return <Loading />;

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