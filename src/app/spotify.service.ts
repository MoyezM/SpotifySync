import { Subject, Observable } from 'rxjs';
import { Injectable } from '@angular/core';
import SpotifyWebApi from 'spotify-web-api-js';

declare global {
  interface Window {
    onSpotifyWebPlaybackSDKReady: any;
    Spotify: any;

   }
}

@Injectable({
  providedIn: 'root'
})
export class SpotifyService {
  loggedIn: boolean;
  state;
  player;
  deviceId;
  private token: string;
  private stateSubject = new Subject<any>();
  getState$: Observable<any>;
  spotifyApi = new SpotifyWebApi(); 

  constructor() {
    this.getState$ = this.stateSubject.asObservable();
  }
  /**
   *
   *
   * @param {data} data
   * @memberof SpotifyService
   */
  getState(data) {
    this.state = data;
    this.stateSubject.next(this.state);
  }
  /**
   *
   *
   * @memberof SpotifyService
   */
  init() {
    this.setToken().then(() => {
      this.initPlayer().then(() => {
        this.setDevice();
      });
    });
  }
  /**
   *
   *
   * @returns
   * @memberof SpotifyService
   */
  initPlayer() {
    return new Promise((resolve, reject) => {
      window.onSpotifyWebPlaybackSDKReady = () => {
        this.player = new window.Spotify.Player({
          name: 'SpotifySync',
          getOAuthToken: callback => {
            callback(this.token);
          },
          volume: 1.0
        });
        this.player.connect().then(success => {
          if (success) {
            console.log('The Web Playback SDK successfully connected to Spotify!');
            return true;
          }
        });
        this.player.addListener('ready', ({ device_id }) => {
          this.deviceId = device_id;
          console.log(this.deviceId);
        });
        this.player.addListener('player_state_changed', state => {
          this.getState(state);
        });
        resolve(this.state);
      };
    });
  }
  /**
   *
   *
   * @returns {Promise} 
   * @memberof SpotifyService
   */
  setToken() {
    return new Promise((resolve, reject) => {
      const params = this.getHashParams();
      this.token = params.access_token;
      if (this.token) {
        this.spotifyApi.setAccessToken(this.token)
      }
      resolve(this.token);
    });
  }
  /**
   *
   *
   * @returns {hashParams}
   * @memberof SpotifyService
   */
  getHashParams(): any {
    let hashParams = {};
    let e, r = /([^&;=]+)=?([^&;]*)/g,
        q = window.location.hash.substring(3);
    while ( e = r.exec(q)) {
       hashParams[e[1]] = decodeURIComponent(e[2]);
    }
    return hashParams;
  }

  setDevice() {
    setTimeout(() => {
      this.spotifyApi.transferMyPlayback([this.deviceId], {play: true});
    }, 2500);
  }

  pausePlayback() {
    this.spotifyApi.pause();
  }

  resumePlayback() {
    this.spotifyApi.play();
  }

  skipNext() {
    this.spotifyApi.skipToNext();
  }

  skipPrevious() {
    this.spotifyApi.skipToPrevious();
  }

  getSongTime() {
    this.spotifyApi.getMyCurrentPlaybackState()
  }
  
  togglePlayback(paused) {
    if (paused) {
      this.spotifyApi.pause();
    } else if (!paused) {
      this.spotifyApi.play()
    }
  }

}
