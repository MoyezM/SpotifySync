import { WebSocketService } from './../web-socket.service';
import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { SpotifyService } from '../spotify.service';


@Component({
  selector: 'app-queue',
  templateUrl: './queue.component.html',
  styleUrls: ['./queue.component.scss']
})
export class QueueComponent implements OnInit {
  songResults;
  songResultName;
  queue = [];
  song = new FormGroup({
    songSearch: new FormControl('')
  });

  constructor(private spotify: SpotifyService, private socket: WebSocketService) {}

  ngOnInit(): void {
    this.socket.onModifyQueue$().subscribe((queue) => {
      this.queue = queue;
    });
  }

  onSubmit() {
    this.spotify.spotifyApi.searchTracks(this.song.value.songSearch).then((result) => {
      this.songResults = result.tracks.items;
      this.songResultName = this.songResults.map((song) => {
        return {
          name: song.name,
          artist: song.artists[0].name,
          uri: song.uri,
        };
      });
    });
  }

  onAddQueue(song) {
    this.socket.onAddQueue(song);
  }

  onPopQueue(removedSong) {
    this.socket.onPopQueue(removedSong);
  }

}


