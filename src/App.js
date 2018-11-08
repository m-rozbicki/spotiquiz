import React, { Component } from 'react';
import SpotfiyDataProvider from './SpotifyDataProvider';
import './App.css';

class App extends Component {
  render() {
    return (
          <SpotfiyDataProvider clientId="Put your client id here" />
    );
  }
}

export default App;
