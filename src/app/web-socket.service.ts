import { SpotifyService } from './spotify.service';
import { Observable } from 'rxjs';
import { Injectable } from '@angular/core';
import * as io from 'socket.io-client';
import * as Rx from 'rxjs';


@Injectable({
  providedIn: 'root'
})
export class WebSocketService {
  private socket;
  
  constructor(private spotify: SpotifyService) { }

  connect() {
    this.socket = io('http://localhost:8888/');
    console.log(this.socket);

  }

  onTogglePlayback$() {
    let observable = new Observable(observer => {
      this.socket.on('togglePlayback', (data) => {
        console.log(data);
        observer.next(data)
      });
    });

    let observer =  {
      next: (data) => {
        return data;
      }
    }
    return Rx.Subject.create(observer, observable)
  }

  onNext$() {
    let observable = new Observable(observer => {
      this.socket.on('next', () => {
        observer.next();
      });
    });

    let observer =  {
      next: () => {}
    };
    return Rx.Subject.create(observer, observable)
  }

  onPrevious$() {
    let observable = new Observable(observer => {
      this.socket.on('previous', () => {
        observer.next();
      });
    });

    let observer =  {
      next: () => {}
    };
    return Rx.Subject.create(observer, observable)
  }

  onNext() {
    this.socket.emit('next');
  }

  onPrevious() {
    this.socket.emit('previous');
  }

  onTogglePlayback(data) {
    this.socket.emit('togglePlayback', data);
  }

}
