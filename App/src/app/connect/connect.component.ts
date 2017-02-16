import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-websocket',
  templateUrl: './connect.component.html',
  styleUrls: ['./connect.component.css']
})
export class ConnectComponent {

  private _ws: WebSocket;

  //public command: string;

  public history: Array<string> = [];

  private helpArr: HTMLCollectionOf<HTMLElement> = <HTMLCollectionOf<HTMLElement>>document.getElementsByClassName('hidden');
  private helpEl: HTMLCollectionOf<HTMLElement> = <HTMLCollectionOf<HTMLElement>>document.getElementsByClassName('btn-prim');
  private loader: HTMLCollectionOf<HTMLElement> = <HTMLCollectionOf<HTMLElement>>document.getElementsByClassName('loader');

  // TODO: In einen Angular 2 Service schieben
  constructor() {  }

  public connect() {
    var i = 0;

    this.helpEl[0].style.display = "none";
    this.loader[0].style.visibility = "visible";

    this._ws = new WebSocket('ws://192.168.0.1:8080');
    //this._ws = new WebSocket('ws://192.168.178.50:8080');

    var timeOut = setTimeout( function () {
      this.loader[0].style.visibility = "hidden";
      (<HTMLCollectionOf<HTMLElement>>document.getElementsByClassName('error'))[0].style.display = "block";
    }, 3000);

    this._ws.onopen = event => {
      clearTimeout(timeOut);
      this.loader[0].style.visibility = "hidden";

      this._ws.onmessage = event => {
        this.history.push('[SERVER] ' + event.data);
      };

      for (i=0; i< 3; i++) {
        this.helpArr[i].style.display = "block";
      }
    }
  }

  public auto() {
    //if (!this.command) {
    //  return;
    //}

    //this.history.push('[CLIENT] ' + this.command);

    //this._ws.send(this.command);
    this._ws.send('auto');
    this.history.push('[CLIENT] ' + 'auto');

    //this.command = '';
  }

  public man() {
    var i = 0;
    //if (!this.command) {
    //  return;
    //}

    //this.history.push('[CLIENT] ' + this.command);

    //this._ws.send(this.command);
    this._ws.send('manual');
    this.history.push('[CLIENT] ' + 'manual');

    //this.command = '';
    for (i=0; i< 3; i++) {
      this.helpArr[i].style.display = "none";
    }
    for (i=3; i< this.helpArr.length; i++) {
      this.helpArr[i].style.display = "block";
    }
  }

  public back() {
    var i = 0;

    for (i=3; i< this.helpArr.length; i++) {
      this.helpArr[i].style.display = "none";
    }
    for (i=0; i< 3; i++) {
      this.helpArr[i].style.display = "block";
    }
  }
}
