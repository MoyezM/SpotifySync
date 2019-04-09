import { WebSocketService } from './../web-socket.service';
import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { SpotifyService } from '../spotify.service';
import { song } from '../models';

@Component({
  selector: 'app-player',
  templateUrl: './player.component.html',
  styleUrls: ['./player.component.scss']
})
export class PlayerComponent implements OnInit {

  /**
   * contains the url for the
   * album image
   * @type {string}
   * @memberof PlayerComponent
   */
  imageURL: string;

  /**
   * contains the array
   * artists for the song
   * @type {Array<any>}
   * @memberof PlayerComponent
   */
  artists:  Array<any>;

  /**
   * Holds the name of
   * the album for the
   * current song
   * @type {string}
   * @memberof PlayerComponent
   */
  album: string;

  /**
   * Holds the name of
   * the song for the
   * current song
   * @type {string}
   * @memberof PlayerComponent
   */
  song: string;

  /**
   * Holds the current
   * playback state
   * @type {boolean}
   * @memberof PlayerComponent
   */
  paused: boolean = true;

  /**
   * Holds the mapped name for
   * the combined artist string
   * @type {string}
   * @memberof PlayerComponent
   */
  artistCombined: string;

  /**
   * Contains the current
   * playback time. This is
   * checked ever second
   * @type {number}
   * @memberof PlayerComponent
   */
  playBackTime: number;

  /**
   * Gets the total playback
   * duration for the current
   * song
   * @type {number}
   * @memberof PlayerComponent
   */
  playBackDuration: number;

  /**
   * holds the playback percentage
   * of the current song
   * @type {number}
   * @memberof PlayerComponent
   */
  playBackPercent: number;

  /**
   * Holds the data for the current song
   * in an object to pass into the socket
   * @type {song}
   * @memberof PlayerComponent
   */
  currentSong: song = {
    song: '',
    artist: '',
    uri: ''
  };

  /**
   * Subscription to the Spotify
   * state listener created in
   * the Spotify service
   * @memberof PlayerComponent
   */
  state = this.spotify.getState$.subscribe(data => {
    this.updateData(data);
    return data;
  });

  constructor(private spotify: SpotifyService, private ref: ChangeDetectorRef, private socket: WebSocketService) {
    // Initializes the spotify service when the player component loads
    this.spotify.init();
  }

  ngOnInit() {
    // Subscription to the values emitted from the socket
    this.socket.onTogglePlayback$().subscribe((data) => {
      this.spotify.togglePlayback(data);
    });

    this.socket.onNext$().subscribe((nextSong) => {
      this.spotify.playTrack(nextSong.uri);
    });

    this.socket.onPrevious$().subscribe((previousSong) => {
      this.spotify.playTrack(previousSong.uri);
    });

    // Checks the playback time of the song
    this.getPlaybackTime();
  }

  /**
   * Called whenever the Spotify service
   * listener on the state updates its value.
   * Updates the local values.
   * @param {any} data
   * @memberof PlayerComponent
   */
  updateData(data: any) {
    if (this.imageURL !== data.track_window.current_track.album.images[2].url) {
      this.imageURL = data.track_window.current_track.album.images[2].url;
      this.ref.detectChanges();
    }
    if (this.artists !== data.track_window.current_track.artists) {
      this.artists = data.track_window.current_track.artists;
      this.artistCombined = this.artists.map(artist  => artist.name).join(', ');
      this.ref.detectChanges();
    }
    if (this.album !== data.track_window.current_track.artists) {
      this.album = data.track_window.current_track.album.name;
      this.ref.detectChanges();
    }
    if (this.song !== data.track_window.current_track.name) {
      this.playBackDuration = data.duration;
      this.song = data.track_window.current_track.name;
      this.ref.detectChanges();
    }
    if (this.paused !== data.paused) {
      this.paused = data.paused;
      this.ref.detectChanges();
    }

    const song: song = {
      song: data.track_window.current_track.name,
      artist: data.track_window.current_track.artists[0].name,
      uri: data.track_window.current_track.uri
    };

    if (this.currentSong !== song) {
      this.currentSong = song;
    }
  }

  /**
   * Used to tell the socket 
   * to toggle playback for all
   * users
   * @memberof PlayerComponent
   */
  togglePlayback() {
    this.socket.onTogglePlayback(this.paused);
  }

  /**
   * Used to tell the socket
   * to go the the next song
   * @memberof PlayerComponent
   */
  onNext() {
    this.socket.onNext(this.currentSong);
  }

  /**
   * Used to tell the socket
   * to go the the previous song
   * @memberof PlayerComponent
   */
  onPrevious() {
    this.socket.onPrevious(this.currentSong);
  }

  /**
   * Gets the current playback time for the song.
   * Pauses the song if it is at 99.5% to bypass
   * Spotify's internal queue. When it reaches 99.5%
   * the next song will be played through the socket.
   * @memberof PlayerComponent
   */
  getPlaybackTime() {
    setInterval(() => {
      if (!this.paused) {
        this.spotify.spotifyApi.getMyCurrentPlaybackState().then((data) => {
          this.playBackTime = data.progress_ms;
          this.playBackPercent = 100 * this.playBackTime / this.playBackDuration;
          this.ref.detectChanges();
          if (this.playBackPercent >= 99) {
            this.spotify.pausePlayback();
             this.socket.onNext(this.currentSong);
          }
        });
      }
    }, 1000);
  }
}
