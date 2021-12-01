import React, { useEffect, useState, Fragment } from "react";
import { Link } from "react-router-dom";
import { confirmAlert } from "react-confirm-alert";

import Alert from "./ui-components/Alert";
import Input from "./form-components/Input";
import Loading from './ui-components/Loading';
import Select from "./form-components/Select";
import TextArea from "./form-components/TextArea";

import "react-confirm-alert/src/react-confirm-alert.css";
import "./EditMovie.css";

const MPAA_RATINGS = ["G", "PG", "PG-13", "R", "NC17"];

export default function EditMovieFunc(props) {
  const [movie, setMovie] = useState({
    id: 0,
    title: "",
    release_date: "",
    runtime: "",
    mpaa_rating: "",
    rating: "",
    description: "",
  });
  const [isLoaded, setisLoaded] = useState(false);
  const [error, setError] = useState(null);
  const [errors, setErrors] = useState([]);
  const [alert, setAlert] = useState({
    type: "d-none",
    message: "",
  });

  useEffect(() => {
    // Redirect to login page if no JWT provided
    if (!props.jwt) {
      props.history.push({ pathname: "/login" });
      return;
    }

    const id = props.match.params.id;

    if (id > 0) {
      fetch(`${process.env.REACT_APP_API_URL}/v1/movie/` + id)
        .then((response) => {
          if (response.status !== 200) {
            setError("Invalid response code: " + response.status);
          } else {
            setError(null);
          }

          return response.json();
        })
        .then((data) => {
          const releaseDate = new Date(data.movie.release_date);
          data.movie.release_date = releaseDate.toISOString().split("T")[0];
          setMovie(data.movie);
          setisLoaded(true);
        });
    } else {
      setisLoaded(true);
    }
  }, [
    props.history,
    props.jwt,
    props.match.params.id,
  ]);

  const confirmDelete = (evt) => {
    confirmAlert({
      title: "Delete movie",
      message: "Are you sure?",
      buttons: [
        {
          label: "Yes",
          onClick: () => {
            /*
             * Delete the movie
             */

            const headers = new Headers();
            headers.append("Content-Type", "application/json");
            headers.append("Authorization", `Bearer ${props.jwt}`);
            const requestOptions = { method: "GET", headers };

            fetch(
              `${process.env.REACT_APP_API_URL}/v1/admin/deletemovie/${movie.id}`,
              requestOptions,
            )
              .then((response) => response.json())
              .then((data) => {
                if (data.error) {
                  setAlert({
                    type: "alert-danger",
                    message: data.error.message,
                  });
                } else {
                  props.history.push({ pathname: "/admin" });
                }
              });
          }
        },
        {
          label: "No",
          onClick: () => { }
        }
      ]
    });
  }

  const handleChange = (evt) => {
    evt.preventDefault();

    const { name, value } = evt.target;

    if (alert.type !== "d-none") {
      setMovie({
        type: "d-none",
        message: "",
      });
    }
    setMovie({
      ...movie,
      [name]: value,
    });
  }

  const handleSubmit = (evt) => {
    evt.preventDefault();

    // Client-side validation
    const errors = [];
    if (movie.title === "") {
      errors.push("title");
    }

    setErrors(errors);

    if (errors.length > 0) {
      return false;
    }

    const data = new FormData(evt.target);
    const payload = Object.fromEntries(data.entries());
    const headers = new Headers();
    headers.append("Content-Type", "application/json");
    headers.append("Authorization", `Bearer ${props.jwt}`);

    const requestOptions = {
      method: "POST",
      body: JSON.stringify(payload),
      headers,
    };

    fetch(`${process.env.REACT_APP_API_URL}/v1/admin/editmovie`, requestOptions)
      .then((response) => response.json())
      .then((data) => {
        if (data.error) {
          setAlert({
            type: "alert-danger",
            message: data.error.message
          });
        } else {
          props.history.push({ pathname: "/admin" });
        }
      });
  }

  // hasError function checks if the component has form validation errors
  const hasError = (key) => errors.indexOf(key) !== -1;

  if (error) return <div>Error: {error.message}</div>;
  if (!isLoaded) return <Loading />;

  return (
    <Fragment>
      <h2>Add/Edit Movie</h2>
      <Alert
        alertType={alert.type}
        alertMessage={alert.message}
      />
      <hr />
      <form onSubmit={handleSubmit}>
        <input
          type="hidden"
          name="id"
          id="id"
          value={movie.id}
          onChange={handleChange}
        />

        <Input
          className={hasError("title") ? "is-invalid" : ""}
          name={"title"}
          title={"Title"}
          type={"text"}
          value={movie.title}
          handleChange={handleChange}
          errorDiv={hasError("title") ? "text-danger" : "d-none"}
          errorMsg={"Please enter a Title"}
        />

        <Input
          name={"release_date"}
          title={"Release date"}
          type={"date"}
          value={movie.release_date}
          handleChange={handleChange}
        />

        <Input
          name={"runtime"}
          title={"Runtime"}
          type={"text"}
          value={movie.runtime}
          handleChange={handleChange}
        />

        <Select
          name={"mpaa_rating"}
          title={"MPAA rating"}
          value={movie.mpaa_rating}
          handleChange={handleChange}
          options={MPAA_RATINGS}
          placeholder={"Choose ..."}
        />


        <Input
          name={"rating"}
          title={"Rating"}
          type={"text"}
          value={movie.rating}
          handleChange={handleChange}
        />

        <TextArea
          name={"description"}
          title={"Description"}
          value={movie.description}
          rows={3}
          handleChange={handleChange}
        />

        <hr />

        <button className="btn btn-primary">
          Save
        </button>
        <Link to="/admin" className="btn btn-warning ms-1">
          Cancel
        </Link>
        {movie.id > 0 && (
          <a
            href="#!"
            onClick={(e) => confirmDelete(e)}
            className="btn btn-danger ms-1">
            Delete
          </a>
        )}
      </form>
    </Fragment>
  );
}