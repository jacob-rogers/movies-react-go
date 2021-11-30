import React, { Component, Fragment } from 'react';
import { Link } from 'react-router-dom';
import Input from './form-components/Input';

export default class Graphql extends Component {
  constructor(props) {
    super(props);
    this.state = {
      movies: [],
      isLoaded: false,
      error: null,
      alert: {
        type: "d-none",
        message: "",
      },
      searchTerm: "",
    };

    this.handleChange = this.handleChange.bind(this);
  }

  getAllMovies() {
    const payload = `
    {
      list {
        id
        title
        runtime
        year
        description
      }
    }`

    const headers = new Headers();
    headers.append("Content-Type", "application/json");

    const requestOptions = {
      method: "POST",
      body: payload,
      headers,
    };

    fetch("http://localhost:4000/v1/graphql", requestOptions)
      .then((response) => response.json())
      .then((data) => {
        const theList = Object.values(data.data.list);

        return theList;
      })
      .then((theList) => {
        this.setState({
          movies: theList,
          isLoaded: true,
        });
      });
  }

  componentDidMount() {
    this.getAllMovies();
  }

  handleChange = (evt) => {
    const { value } = evt.target;

    this.setState({
      searchTerm: value,
    });
    
    // Should take an effect only when search term is more
    // than 2 characters long
    if (value.length >= 2) {
      this.performSearch();
    } else {
      this.getAllMovies();
    }
  }

  performSearch() {
    const payload = `
    {
      search(titleContains: "${this.state.searchTerm}") {
        id
        title
        runtime
        year
        description
      }
    }`

    const headers = new Headers();
    headers.append("Content-Type", "application/json");

    const requestOptions = {
      method: "POST",
      body: payload,
      headers,
    };

    fetch("http://localhost:4000/v1/graphql", requestOptions)
      .then((response) => response.json())
      .then((data) => {
        const theList = Object.values(data.data.search);

        return theList;
      })
      .then((theList) => {
        console.log(theList);
        if (theList.length) {
          this.setState({
            movies: theList,
          });
        } else {
          this.setState({
            movies: [],
          });
        }
      });
  }

  render() {
    const { movies } = this.state;

    return (
      <Fragment>
        <h2>GraphQL</h2>
        <hr />

        {/* Input for searching movies by tiitle */}
        <Input
          title={"Search"}
          type={"text"}
          name={"search"}
          value={this.state.searchTerm}
          handleChange={this.handleChange}
        />

        <div className="list-group">
          {movies.map((m) => (
            <Link
              key={m.id}
              className="list-group-item list-group-item-action"
              to={`/moviesgraphql/${m.id}`}>
              <strong>{m.title}</strong>
              <br />
              <small className="text-muted">
                ({m.year} - {m.runtime} minutes)
              </small>
              <br />
              {m.description.length > 100
                ? m.description.slice(0, 100) + " ..."
                : m.description}
            </Link>)
          )}
        </div>
      </Fragment>
    );
  }
}
