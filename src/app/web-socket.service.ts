import { Observable } from 'rxjs';
import { Injectable } from '@angular/core';
import * as io from 'socket.io-client';
import * as Rx from 'rxjs';


@Injectable({
  providedIn: 'root'
})
export class WebSocketService {

  /**
   *
   * Instance of the socket
   * @private
   * @memberof WebSocketService
   */
  private socket;

  /**
   * Connects the socket when the service is created
   * @memberof WebSocketService
   */
  constructor() {
    this.connect();
  }

  /**
   *
   * connects the the node server
   * @memberof WebSocketService
   */
  connect() {
    this.socket = io('http://localhost:8888/');
  }

  /**
   * Observable to handle play/pause
   * when the socket emits 'togglePlayback'
   * @returns Observable
   * @memberof WebSocketService
   */
  onTogglePlayback$() {
    let observable = new Observable(observer => {
      this.socket.on('togglePlayback', (data) => {
        observer.next(data)
      });
    });

    let observer =  {
      next: (data) => {
        return data;
      }
    };
    return Rx.Subject.create(observer, observable);
  }

  /**
   * Observable to handle modifications
   * to handle the queue from the socket
   * @returns Observable
   * @memberof WebSocketService
   */
  onModifyQueue$() {
    let observable = new Observable(observer => {
      this.socket.on('modifyQueue', (queue) => {
        observer.next(queue);
      });
    });

    let observer =  {
      next: (queue) => {
        return queue;
      }
    };

    return Rx.Subject.create(observer, observable);
  }

  /**
   * Observable to detect when the
   * socket tells the client to go
   * to the next song
   * @returns Observable
   * @memberof WebSocketService
   */
  onNext$() {
    let observable = new Observable(observer => {
      this.socket.on('next', (nextSong) => {
        observer.next(nextSong);
      });
    });

    let observer =  {
      next: (nextSong) => {
        return nextSong;
      }
    };
    return Rx.Subject.create(observer, observable)
  }

  /**
   * Observable to detect when the
   * socket to go to the previous song
   * @returns Observable
   * @memberof WebSocketService
   */
  onPrevious$() {
    let observable = new Observable(observer => {
      this.socket.on('previous', (previousSong) => {
        observer.next(previousSong);
      });
    });

    let observer =  {
      next: (previousSong) => {
        return previousSong;
      }
    };
    return Rx.Subject.create(observer, observable);
  }

  onNext(currentSong) {
    this.socket.emit('next', currentSong);
  }

  onPrevious(song) {
    this.socket.emit('previous', song);
  }

  onTogglePlayback(data) {
    this.socket.emit('togglePlayback', data);
  }

  onAddQueue(song) {
    this.socket.emit('addToQueue', song);
  }

  onPopQueue(song) {
    this.socket.emit('removeFromQueue', song);
  }

}
