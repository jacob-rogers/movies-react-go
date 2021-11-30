import React, { Component } from 'react';

import './Home.css';

export default class Home extends Component {
  render() {
    return (
      <div className="text-center">
        <h2>This is a home page.</h2>
        <hr />
        <div className="tickets"></div>
      </div>
    );
  }
}
