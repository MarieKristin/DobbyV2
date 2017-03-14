import { Component, OnInit } from '@angular/core';
import '../../assets/virtualjoystick.js';

@Component({
  selector: 'app-websocket',
  templateUrl: './connect.component.html',
  styleUrls: ['./connect.component.css']
})

export class ConnectComponent {

  private _ws: WebSocket;

  //public command: string;

  public history: Array<string> = [];

  private arrChoose: HTMLCollectionOf<HTMLElement> = <HTMLCollectionOf<HTMLElement>>document.getElementsByClassName('hidden');
  private arrMan: HTMLCollectionOf<HTMLElement> = <HTMLCollectionOf<HTMLElement>>document.getElementsByClassName('manual');
  private helpEl: HTMLCollectionOf<HTMLElement> = <HTMLCollectionOf<HTMLElement>>document.getElementsByClassName('btn-prim');
  private loader: HTMLCollectionOf<HTMLElement> = <HTMLCollectionOf<HTMLElement>>document.getElementsByClassName('loader');
  private direction: HTMLCollectionOf<HTMLElement> = <HTMLCollectionOf<HTMLElement>>document.getElementsByClassName('direction');
  private distance: HTMLCollectionOf<HTMLElement> = <HTMLCollectionOf<HTMLElement>>document.getElementsByClassName('distance');

  private joystick;

  //start of debugging
  public init() {
    this.helpEl[0].style.display = "none";

    this.joystick = new VirtualJoystick({
      mouseSupport: true,
      stationaryBase: true,
      direction: this.direction[0],
      distance: this.distance[0],
      baseX: 200,
      baseY: 400,
      limitStickTravel: true,
      stickRadius: 50
    });

    var laufI;
    for (laufI=0; laufI< this.arrMan.length; laufI++) {
      this.arrMan[laufI].style.display = "block";
    }
  }
  //end of debugging

  // TODO: In einen Angular 2 Service schieben
  constructor() {  }

  public connect() {
    var i = 0;

    this.helpEl[0].style.display = "none";
    this.loader[0].style.visibility = "visible";

    this._ws = new WebSocket('ws://192.168.0.1:8080');
    //this._ws = new WebSocket('ws://192.168.178.50:8080');

    var timeOut = setTimeout( function () {
      (<HTMLCollectionOf<HTMLElement>>document.getElementsByClassName('loader'))[0].style.visibility = "hidden";
      (<HTMLCollectionOf<HTMLElement>>document.getElementsByClassName('error'))[0].style.display = "block";
    }, 3000);

    this._ws.onopen = event => {
      clearTimeout(timeOut);
      this.loader[0].style.visibility = "hidden";

      this._ws.onmessage = event => {
        this.history.push('[SERVER] ' + event.data);
      };

      for (i=0; i< this.arrChoose.length; i++) {
        this.arrChoose[i].style.display = "block";
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
    this.joystick = new VirtualJoystick({
      mouseSupport: true,
      stationaryBase: true,
      direction: this.direction[0],
      distance: this.distance[0],
      baseX: 200,
      baseY: 400,
      limitStickTravel: true,
      stickRadius: 50
    });


    //if (!this.command) {
    //  return;
    //}

    //this.history.push('[CLIENT] ' + this.command);

    //this._ws.send(this.command);
    this._ws.send('manual');
    this.history.push('[CLIENT] ' + 'manual');

    //this.command = '';
    for (i=0; i< this.arrChoose.length; i++) {
      this.arrChoose[i].style.display = "none";
    }
    for (i=0; i< this.arrMan.length; i++) {
      this.arrMan[i].style.display = "block";
    }

    //this.joystick._container.addEventListener( 'mousemove'	, this.calculateDirection	, false );
    //this.joystick.addEventListener('moved', this.calculateDirection(), false);
    //while(1) {
    //  (<HTMLElement>document.getElementById('debug1')).innerHTML = "Direction: " + this.joystick.calculateDirection();
    //}
  }

  public back() {
    var i = 0;

    this.joystick.destroy();
    this._ws.send('abbrManuell');
    this.history.push('[CLIENT] ' + 'abbrManuell');
    for (i=0; i< this.arrMan.length; i++) {
      this.arrMan[i].style.display = "none";
    }
    for (i=0; i< this.arrChoose.length; i++) {
      this.arrChoose[i].style.display = "block";
    }
  }
}
