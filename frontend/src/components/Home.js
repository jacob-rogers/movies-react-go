import React, { Component } from 'react';

import MovieTickets from '../images/movie_tickets.jpg';
import './Home.css';

export default class Home extends Component {
  render() {
    return (
      <div className="text-center">
        <h2>This is a home page.</h2>
        <hr />
        <img src={MovieTickets} alt="Movie tickets" />
      </div>
    );
  }
}
