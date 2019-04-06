import { WebSocketService } from './../web-socket.service';
import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { SpotifyService } from '../spotify.service';

@Component({
  selector: 'app-player',
  templateUrl: './player.component.html',
  styleUrls: ['./player.component.scss']
})
export class PlayerComponent implements OnInit {
  imageURL;
  artists;
  album;
  song;
  paused;
  artistCombined;
  nextPlaying;
  nextPlayingSongs;
  playBackTime;
  playBackDuration;
  playBackPercent;


  state = this.spotify.getState$.subscribe(data => {
    this.updateData(data);
    return data;
  });

  constructor(private spotify: SpotifyService, private ref: ChangeDetectorRef, private socket: WebSocketService) {
    this.spotify.init();
  }

  ngOnInit() {
    this.socket.connect();

    this.socket.onTogglePlayback$().subscribe((data) => {
      this.updatePlayer('playback', data);
    });

    this.socket.onNext$().subscribe(() => {
      this.spotify.skipNext();
    });

    this.socket.onPrevious$().subscribe(() => {
      this.spotify.skipPrevious();
    });

    this.getPlaybackTime();
  }

  updatePlayer(type, value) {
    switch (type) {
      case 'playback':
        console.log(value);
        this.spotify.togglePlayback(value);
    }
  }

  updateData(data) {
    console.log(data);
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
    if (this.nextPlaying !== data.track_window.next_tracks) {
      this.nextPlaying = data.track_window.next_tracks;
      this.nextPlayingSongs = this.nextPlaying.map(track => track.name);
      this.ref.detectChanges();
    }
  }

  togglePlayback() {
    this.socket.onTogglePlayback(this.paused);
  }

  onNext() {
    this.socket.onNext();
  }

  onPrevious() {
    this.socket.onPrevious();
  }

  getPlaybackTime() {
    setInterval(() => {
      if (!this.paused) {
        this.spotify.spotifyApi.getMyCurrentPlaybackState().then((data) => {
          this.playBackTime = data.progress_ms;
          this.playBackPercent = 100 * this.playBackTime / this.playBackDuration;
          this.ref.detectChanges();
          if (this.playBackPercent >= 99.5) {
            this.spotify.pausePlayback();
          }
        });
      }
    }, 500);
  }
}
