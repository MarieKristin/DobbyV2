import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-websocket',
  templateUrl: './console.component.html',
  styleUrls: ['./console.component.css']
})
export class ConsoleComponent {

  private _ws: WebSocket;

  public command: string;

  public history: Array<string> = [];

  private helpArr: HTMLCollectionOf<HTMLElement> = <HTMLCollectionOf<HTMLElement>>document.getElementsByClassName('hidden');
  private helpEl: HTMLCollectionOf<HTMLElement> = <HTMLCollectionOf<HTMLElement>>document.getElementsByClassName('btn-primary');
  private loader: HTMLCollectionOf<HTMLElement> = <HTMLCollectionOf<HTMLElement>>document.getElementsByClassName('loader');

  // TODO: In einen Angular 2 Service schieben
  constructor() {  }

  public connect() {
    this.loader[0].style.display = "block";
    this.helpEl[0].style.display = "none";

    this._ws = new WebSocket('ws://192.168.0.1:2609');

    var timeOut = setTimeout(this.timeOutConnect, 3000, this._ws, this.loader[0]);

    this._ws.onopen = event => {
      clearTimeout(timeOut);
      this.loader[0].style.display = "none";

      this._ws.onmessage = event => {
        this.history.push('[SERVER] ' + event.data);
      };

      for (var i=0; i< this.helpArr.length; i++) {
        this.helpArr[i].style.display = "block";
      }
     }
  }

  public timeOutConnect(ws,loader) {
      ws.close();
      loader.style.display = "none";
      (<HTMLCollectionOf<HTMLElement>>document.getElementsByClassName('error'))[0].style.display = "block";
    }

  public send() {
    if (!this.command) {
      return;
    }

    this.history.push('[CLIENT] ' + this.command);

    this._ws.send(this.command);

    this.command = '';
  }
}
