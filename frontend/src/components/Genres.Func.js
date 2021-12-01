import React, { useEffect, useState, Fragment } from "react";
import { Link } from "react-router-dom";
import Loading from "./Loading";

export default function GenresFunc(props) {
  const [genres, setGenres] = useState([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch(`${process.env.REACT_APP_API_URL}/v1/genres`)
      .then((response) => {
        if (response.status !== 200) {
          setError("Invalid response code: " + response.status);
        } else {
          setError(null);
        }

        return response.json();
      })
      .then((data) => {
        setGenres(data.genres);
        // Just to simulate network/operational latencies
        setTimeout(() => {
          setIsLoaded(true);
        }, 500);
      });
    }, []);

  if (error) return <div>Error: {error.message}</div>;

  return (
    <Fragment>
      <h2>Genres</h2>
      {!isLoaded ? <Loading /> : (
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
      )}
    </Fragment>
  );
}