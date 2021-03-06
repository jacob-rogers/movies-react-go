import React, { Component, Fragment } from "react";
import { BrowserRouter as Router, Switch, Route, Link } from "react-router-dom";

import AdminFunc from "./components/Admin.Func";
import EditMovieFunc from "./components/EditMovie.Func";
import GenresFunc from "./components/Genres.Func";
import Graphql from "./components/Graphql";
import Home from "./components/Home";
import LoginFunc from "./components/Login.Func";
import MoviesFunc from "./components/Movies.Func";
import OneGenreFunc from "./components/OneGenre.Func";
import OneMovieFunc from "./components/OneMovie.Func";
import OneMovieGraphql from "./components/OneMovieGraphql";

export default class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      jwt: "",
    }

    this.handleJWTChange = this.handleJWTChange.bind(this);
  }

  componentDidMount() {
    // check if jwt entry is in local storage
    const t = window.localStorage.getItem("jwt");
    if (t && !this.state.jwt) {
      this.setState({ jwt: JSON.parse(t) });
    }
  }

  handleJWTChange = (jwt) => this.setState({ jwt });

  logout = () => {
    this.setState({ jwt: "" });
    window.localStorage.removeItem("jwt");
  }

  render() {
    let loginLink;
    if (!this.state.jwt) {
      loginLink = <Link to="/login">Login</Link>
    } else {
      loginLink = <Link to="/logout" onClick={this.logout}>Logout</Link>
    }

    return (
      <Router>
        <div className="container">
          <div className="row">
            <div className="col mt-3">
              <h1 className="mt-3">Go Watch Movie!</h1>
            </div>
            <div className="col mt-3 text-end">
              {loginLink}
            </div>
            <hr className="mb-3" />
          </div>

          <div className="row">
            <div className="col-md-2">
              <ul className="list-group">
                <li className="list-group-item">
                  <Link to="/">Home</Link>
                </li>
                <li className="list-group-item">
                  <Link to="/movies">Movies</Link>
                </li>
                <li className="list-group-item">
                  <Link to="/genres">Genres</Link>
                </li>
                {this.state.jwt && (
                  <Fragment>
                    <li className="list-group-item">
                      <Link to="/admin/movie/0">Add movie</Link>
                    </li>
                    <li className="list-group-item">
                      <Link to="/admin">Manage Catalogue</Link>
                    </li>
                  </Fragment>
                )}
                <li className="list-group-item">
                  <Link to="/graphql">GraphQL</Link>
                </li>
              </ul>
            </div>

            <div className="col-md-10">
              <Switch>
                <Route path="/movies/:id" component={OneMovieFunc} />
                <Route path="/moviesgraphql/:id" component={OneMovieGraphql} />

                <Route path="/movies">
                  <MoviesFunc />
                </Route>

                <Route path="/genres/:id" component={OneGenreFunc} />

                <Route
                  exact
                  path="/login"
                  component={(props) => (
                    <LoginFunc {...props} handleJWTChange={this.handleJWTChange} />
                  )}
                />

                <Route exact path="/graphql"><Graphql /></Route>

                <Route exact path="/genres">
                  <GenresFunc />
                </Route>

                <Route
                  path="/admin/movie/:id"
                  component={(props) => (
                    <EditMovieFunc {...props} jwt={this.state.jwt} />
                  )}
                />

                <Route
                  path="/admin"
                  component={(props) => (
                    <AdminFunc {...props} jwt={this.state.jwt} />
                  )}
                />

                <Route path="/">
                  <Home />
                </Route>
              </Switch>
            </div>
          </div>
        </div>
      </Router>
    );
  }
}
