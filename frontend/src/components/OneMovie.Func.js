import React, { useEffect, useState, Fragment } from "react";
import Loading from "./Loading";

export default function OneMovieFunc(props) {
  const [movie, setMovie] = useState({});
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch(`${process.env.REACT_APP_API_URL}/v1/movie/` + props.match.params.id)
      .then((response) => {
        if (response.status !== 200) {
          setError("Invalid response code: " + response.status);
        } else {
          setError(null);
        }

        return response.json();
      })
      .then((data) => {
        if (data.movie.genres) {
          data.movie.genres = Object.values(data.movie.genres);
        } else {
          data.movie.genres = [];
        }
        setMovie(data.movie);
        // Just to simulate network/operational latencies
        setTimeout(() => {
          setIsLoaded(true);
        }, 200);
      });
  }, [props.match.params.id]);

  
  if (error) return <div>Error: {error.message}</div>;
  if (!isLoaded) return <Loading />;

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
