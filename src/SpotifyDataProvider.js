import React, { Component } from 'react';
import Quiz from './Quiz';
const demoPlaylist = require('./demo.json');

class SpotifyDataProvider extends Component {
  static defaultProps = {
    redirectUri: window.location.origin + window.location.pathname
  };

  constructor (props) {
    super(props);

    this.loginUrl = 'https://accounts.spotify.com/authorize' +
      '?response_type=token' +
      '&client_id=' + this.props.clientId +
      '&scope=playlist-read-private' +
      '&redirect_uri=' + encodeURIComponent(this.props.redirectUri);

    this.state = {
      authToken: window.location.hash.indexOf('access_token') > 0
        ? window.location.hash.substring(window.location.hash.indexOf('access_token')+13)
        : null,
      playlists: [],
      selectedPlaylist: null,
      tracks: [],
    };
  }

  getPlaylists() {
    return fetch('https://api.spotify.com/v1/me/playlists',
      {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': ('Bearer ' + this.state.authToken)
        }
      })
      .then(response => response.json())
      .then(result => result.items);
  }

  getTracks(href, tracks = []) {
    const reshapeTrack = (track) => ({
      name: track.name,
      artist: track.artists[0].name,
      album: track.album.name,
      year: (new Date(track.album.release_date)).getFullYear(),
      preview_url: track.preview_url
    })

    return fetch(href,
      {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': ('Bearer ' + this.state.authToken)
        }
      })
      .then(response => response.json())
      .then(result => {
        result.items.forEach(item => tracks.push(reshapeTrack(item.track)));
        if (result.next)
          return this.getTracks(result.next, tracks);
        return tracks;
      });
  }

  componentDidMount () {
    if(this.state.authToken)
      this.getPlaylists()
        .then((playlists) => this.setState({
          playlists: playlists.filter(playlist => playlist.tracks.total > 50)
        }));
  }

  selectPlaylist(playlist) {
    this.setState({selectedPlaylist: playlist});
    this.getTracks(playlist.tracks.href)
      .then(tracks => this.setState({tracks: tracks}));
  }

  demo(){
    this.setState({
      authToken: 'demo',
      selectedPlaylist: {tracks: {total: demoPlaylist.length}},
      tracks: demoPlaylist,
      demo: true
    })
  }

  reset() {
    if(this.state.demo) {
      this.setState({
        authToken: null,
        selectedPlaylist: null,
        tracks: [],
        demo: false
      })
    }
    else
      window.location.replace(this.loginUrl);
  }

  render() {
    if (!this.state.authToken) {
      return (
        <React.Fragment>
          <p className='instruction'>You need to log in to begin. You will grant access only to permissions listed in the next step. Your password will not be revealed.</p>
          <p><a href={this.loginUrl}><button>Log in to Spotify</button></a></p>
          <p><button onClick={(e) => this.demo()}>Demo</button></p>
        </React.Fragment>
      );
    }
    else if (!this.state.selectedPlaylist && this.state.playlists.length === 0) {
      return (
        <React.Fragment>
          <p className='instruction'>
            No proper playlists were loaded.<br/>
            A proper playlist contains at least 50 tracks.
          </p>

        </React.Fragment>
      );
    }
    else if (!this.state.selectedPlaylist) {
      return (
        <React.Fragment>
          <p className='instruction'>
            Choose a playlist.<br/>
            Only playlists containing at least 50 tracks are shown.
          </p>

          <ul>
            {
              this.state.playlists.map(playlist =>
                <li key={playlist.name} onClick={(e) => this.selectPlaylist(playlist)}>
                  {playlist.name}
                </li>
              )
            }
          </ul>

        </React.Fragment>
      );
    }
    else if (this.state.selectedPlaylist && this.state.tracks.length === this.state.selectedPlaylist.tracks.total) {
      return (
        <Quiz tracks={this.state.tracks} onReset={(e) => this.reset()}/>
      );
    }
    else {
      return null;
    }
  }
}

export default SpotifyDataProvider;
