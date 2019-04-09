import { WebSocketService } from './../web-socket.service';
import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { SpotifyService } from '../spotify.service';
import { song } from '../models';


@Component({
  selector: 'app-queue',
  templateUrl: './queue.component.html',
  styleUrls: ['./queue.component.scss']
})
export class QueueComponent implements OnInit {
  songResults: any;
  songResultName: Array<song>;
  queue = [];
  song = new FormGroup({
    songSearch: new FormControl('')
  });

  constructor(private spotify: SpotifyService, private socket: WebSocketService) {}

  ngOnInit(): void {
    // Subscribes to the modified Queues from the socket
    this.socket.onModifyQueue$().subscribe((queue) => {
      this.queue = queue;
    });
  }

  /**
   * Gets the tracks that are the result
   * of the search query and formats it
   * @memberof QueueComponent
   */
  onSubmit() {
    this.spotify.spotifyApi.searchTracks(this.song.value.songSearch).then((result) => {
      this.songResults = result.tracks.items;
      this.songResultName = this.songResults.map((song) => {
        return {
          song: song.name,
          artist: song.artists[0].name,
          uri: song.uri,
        };
      });
    });
  }

  /**
   * Adds songs to the queue
   * through the socket
   * @param {song} song
   * @memberof QueueComponent
   */
  onAddQueue(song: song) {
    this.socket.onAddQueue(song);
  }

  /**
   * Removes songs from the
   * queue using the socket
   * @param {song} removedSong
   * @memberof QueueComponent
   */
  onPopQueue(removedSong: song) {
    this.socket.onPopQueue(removedSong);
  }

}


