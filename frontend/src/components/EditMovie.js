import React, { Component, Fragment } from "react";
import { Link } from "react-router-dom";
import { confirmAlert } from "react-confirm-alert";

import Alert from "./ui-components/Alert";
import Input from "./form-components/Input";
import Select from "./form-components/Select";
import TextArea from "./form-components/TextArea";

import "react-confirm-alert/src/react-confirm-alert.css";
import "./EditMovie.css";

const MPAA_RATINGS = ["G", "PG", "PG-13", "R", "NC17"];

export default class EditMovie extends Component {
  constructor(props) {
    super(props);
    this.state = {
      movie: {
        id: 0,
        title: "",
        release_date: "",
        runtime: "",
        mpaa_rating: "",
        rating: "",
        description: "",
      },
      isLoaded: false,
      error: null,
      errors: [],
      alert: {
        type: "d-none",
        message: "",
      },
    };

    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  handleSubmit = (evt) => {
    evt.preventDefault();

    // Client-side validation
    const errors = [];
    if (this.state.movie.title === "") {
      errors.push("title");
    }

    this.setState({ errors });

    if (errors.length > 0) {
      return false;
    }

    const data = new FormData(evt.target);
    const payload = Object.fromEntries(data.entries());
    const headers = new Headers();
    headers.append("Content-Type", "application/json");
    headers.append("Authorization", `Bearer ${this.props.jwt}`);

    const requestOptions = {
      method: "POST",
      body: JSON.stringify(payload),
      headers,
    };

    fetch(`${process.env.REACT_APP_API_URL}/v1/admin/editmovie`, requestOptions)
      .then((response) => response.json())
      .then((data) => {
        if (data.error) {
          this.setState({
            alert: { type: "alert-danger", message: data.error.message },
          });
        } else {
          this.props.history.push({
            pathname: "/admin",
          });
        }
      })
  }

  handleChange = (evt) => {
    evt.preventDefault();

    if (this.state.alert.type !== "d-none") {
      this.setState({
        alert: {
          type: "d-none",
          message: "",
        },
      });
    }

    const { name, value } = evt.target;

    this.setState((prevState) => ({
      movie: {
        ...prevState.movie,
        [name]: value,
      },
    }))
  }

  hasError(key) {
    return this.state.errors.indexOf(key) !== -1;
  }

  componentDidMount() {
    // Redirect to login page if no JWT provided
    if (!this.props.jwt) {
      this.props.history.push({ pathname: "/login" });
      return;
    }

    const { id } = this.props.match.params;

    if (id > 0) {
      fetch(`${process.env.REACT_APP_API_URL}/v1/movie/` + id)
        .then((response) => {
          if (response.status !== 200) {
            const err = Error;
            err.message = "Invalid response code: " + response.status;
            this.setState({ error: err });
          }

          return response.json();
        })
        .then((json) => {
          const releaseDate = new Date(json.movie.release_date);

          this.setState({
            movie: {
              id,
              title: json.movie.title,
              release_date: releaseDate.toISOString().split("T")[0],
              runtime: json.movie.runtime,
              mpaa_rating: json.movie.mpaa_rating,
              rating: json.movie.rating,
              description: json.movie.description,
            },
            isLoaded: true,
          }, (err) => {
            this.setState({
              isLoaded: true,
              error: err,
            })
          });
        });
    } else {
      this.setState({ isLoaded: true });
    }
  }

  confirmDelete = (evt) => {
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
            headers.append("Authorization", `Bearer ${this.props.jwt}`);

            fetch(`${process.env.REACT_APP_API_URL}/v1/admin/deletemovie/` + this.state.movie.id, {
              method: "GET",
              headers,
            })
              .then((response) => response.json())
              .then((data) => {
                if (data.error) {
                  this.setState({
                    alert: {
                      type: "alert-danger",
                      message: data.error.message,
                    },
                  });
                } else {
                  this.props.history.push({
                    pathname: "/admin",
                  });
                }
              })
          }
        },
        {
          label: "No",
          onClick: () => { }
        }
      ]
    });
  }

  render() {
    let { movie, isLoaded, error } = this.state;

    if (error) return <div>Error: {error.message}</div>;

    if (!isLoaded) {
      return <p>Loading ...</p>
    }

    return (
      <Fragment>
        <h2>Add/Edit Movie</h2>
        <Alert
          alertType={this.state.alert.type}
          alertMessage={this.state.alert.message}
        />
        <hr />
        <form onSubmit={this.handleSubmit}>
          <input
            type="hidden"
            name="id"
            id="id"
            value={movie.id}
            onChange={this.handleChange}
          />

          <Input
            className={this.hasError("title") ? "is-invalid" : ""}
            name={"title"}
            title={"Title"}
            type={"text"}
            value={movie.title}
            handleChange={this.handleChange}
            errorDiv={this.hasError("title") ? "text-danger" : "d-none"}
            errorMsg={"Please enter a Title"}
          />

          <Input
            name={"release_date"}
            title={"Release date"}
            type={"date"}
            value={movie.release_date}
            handleChange={this.handleChange}
          />

          <Input
            name={"runtime"}
            title={"Runtime"}
            type={"text"}
            value={movie.runtime}
            handleChange={this.handleChange}
          />

          <Select
            name={"mpaa_rating"}
            title={"MPAA rating"}
            value={movie.mpaa_rating}
            handleChange={this.handleChange}
            options={MPAA_RATINGS}
            placeholder={"Choose ..."}
          />


          <Input
            name={"rating"}
            title={"Rating"}
            type={"text"}
            value={movie.rating}
            handleChange={this.handleChange}
          />

          <TextArea
            name={"description"}
            title={"Description"}
            value={movie.description}
            rows={3}
            handleChange={this.handleChange}
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
              onClick={() => this.confirmDelete()}
              className="btn btn-danger ms-1">
              Delete
            </a>
          )}
        </form>
      </Fragment>
    );
  }
}
