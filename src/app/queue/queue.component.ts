import {Component} from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { SpotifyService } from '../spotify.service';


@Component({
  selector: 'app-queue',
  templateUrl: './queue.component.html',
  styleUrls: ['./queue.component.scss']
})
export class QueueComponent {
  songResults;
  songResultName;
  song = new FormGroup({
    songSearch: new FormControl('')
  });

  constructor(private spotify: SpotifyService) {}

  onSubmit() {
    this.spotify.spotifyApi.searchTracks(this.song.value.songSearch).then((result) => {
      this.songResults = result.tracks.items;
      this.songResultName = this.songResults.map((song) => song.name);
    });
    console.log(this.songResults);
  }

}


