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
  private intervalID;

  //start of debugging
  /*public init() {
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

    this.history.push('[CLIENT] ' + 'JoyStick initiated');
    this.intervalID = setInterval(this.sendToMotor, 3000, this.history, this.joystick);
    //this.intervalID = setInterval(this.sendToMotor, 3000, this.history);
  }*/
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
      this._ws.close();
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
    this._ws.send('automatik');
    this.history.push('[CLIENT] ' + 'automatik');

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

    this.intervalID = setInterval(this.sendToMotor, 500, this.history, this.joystick, this._ws);

    this._ws.send('manuell');
    this.history.push('[CLIENT] ' + 'manuell');

    //this.command = '';
    for (i=0; i< this.arrChoose.length; i++) {
      this.arrChoose[i].style.display = "none";
    }
    for (i=0; i< this.arrMan.length; i++) {
      this.arrMan[i].style.display = "block";
    }
    //(<HTMLElement>document.getElementById('debug1')).innerHTML = "Direction: " + this.joystick.calculateDirection();
  }

  private sendToMotor(historyList, joyStick, webSocket) {
    var message;
    var dir = joyStick.getDirection();
    var dist = joyStick.getDistance();

    //Bereich von 0-90 abgedeckt durch 0-50 [JoyStick]
    //prinzipiell also 1 : 9/5=1.8
    //JoyStick Wertung in 5er Schritten:
    //0-5   :  0=0x00; 6-10  : 18=0x12
    //11-15 : 27=0x1B; 16-20 : 36=0x24
    //21-25 : 45=0x2D; 26-30 : 54=0x36
    //31-35 : 63=0x3F; 36-40 : 72=0x48
    //41-45 : 81=0x51; 46-50 : 90=0x5A

    var switch_dist = Math.ceil(dist/5);
    if(switch_dist == 1 || switch_dist == 0) {
      dist = 0;
    } else {
      dist = ((switch_dist*5)*(1.8*10))/10;
    }

    if(dist == 0) {
      var string_dist:String = '00';
      var other_motor:String = '00';
    } else {
      var string_dist:String = dist.toString(16).toUpperCase();
      var calc_other_motor = Math.round(dist/2);
      var other_motor:String = calc_other_motor.toString(16).toUpperCase();
    }

    switch(dir) {
      case 'Base':
        message = '55-00-AA-00';
        break;
      case 'up':
        message = '55-' + string_dist + '-AA-' + string_dist;
        break;
      case 'up-left':
        message = '55-' + other_motor + '-AA-' + string_dist;
        break;
      case 'up-right':
        message = '55-' + string_dist + '-AA-' + other_motor;
        break;
      case 'down':
        message = 'AA-' + string_dist + '-55-' + string_dist;
        break;
      case 'down-left':
        message = 'AA-' + other_motor + '-55-' + string_dist;
        break;
      case 'down-right':
        message = 'AA-' + string_dist + '-55-' + other_motor;
        break;
      case 'left':
        message = 'AA-' + string_dist + '-AA-' + string_dist;
        break;
      case 'right':
        message = '55-' + string_dist + '-55-' + string_dist;
        break;
      default:
        message = 'send something';
        break;
    }

    webSocket.send(message);
    //historyList.push('[CLIENT] ' + message);
  }

  private back() {
    var i = 0;

    clearInterval(this.intervalID);
    this.joystick.destroy();
    this._ws.send('STOP');
    this.history.push('[CLIENT] ' + 'STOP');
    for (i=0; i< this.arrMan.length; i++) {
      this.arrMan[i].style.display = "none";
    }
    for (i=0; i< this.arrChoose.length; i++) {
      this.arrChoose[i].style.display = "block";
    }
    //this.helpEl[0].style.display = "block";
  }
}
