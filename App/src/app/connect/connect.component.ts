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

  // TODO: In einen Angular 2 Service schieben
  constructor() {  }

  public connect() {
    var i = 0;
    this._ws = new WebSocket('ws://192.168.0.1:8080');
    //this._ws = new WebSocket('ws://192.168.178.50:8080');

    this._ws.onmessage = event => {
      this.history.push('[SERVER] ' + event.data);
    };

    for (i=0; i< this.helpArr.length; i++) {
      this.helpArr[i].style.display = "block";
    }
    this.helpEl[0].style.display = "none";
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
    //if (!this.command) {
    //  return;
    //}

    //this.history.push('[CLIENT] ' + this.command);

    //this._ws.send(this.command);
    this._ws.send('manual');
    this.history.push('[CLIENT] ' + 'manual');

    //this.command = '';
  }
}
