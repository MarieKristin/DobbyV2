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
  //this.helpArr[0].style.display = "none";
  //this.helpArr[1].style.display = "none";

  // TODO: In einen Angular 2 Service schieben
  constructor() {  }

  public connect() {
    this._ws = new WebSocket('ws://192.168.0.1:8080');

    this._ws.onmessage = event => {
      this.history.push('[SERVER] ' + event.data);
    };
    this.helpArr[0].style.display = "block";
    this.helpArr[1].style.display = "block";
    this.helpEl[0].style.display = "none";
    //getElementsByClass(hidden).removeClass(hidden);
    //this.addClass(hidden);
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
