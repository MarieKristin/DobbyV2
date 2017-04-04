import { Component, OnInit } from '@angular/core';
import '../../assets/virtualjoystick.js';

@Component({
  selector: 'app-websocket',
  templateUrl: './connect.component.html',
  styleUrls: ['./connect.component.css']
})

export class ConnectComponent {

  private _ws: WebSocket;

  public history: Array<string> = [];

  private arrChoose: HTMLCollectionOf<HTMLElement> = <HTMLCollectionOf<HTMLElement>>document.getElementsByClassName('hidden');
  private arrMan: HTMLCollectionOf<HTMLElement> = <HTMLCollectionOf<HTMLElement>>document.getElementsByClassName('manual');
  private helpEl: HTMLCollectionOf<HTMLElement> = <HTMLCollectionOf<HTMLElement>>document.getElementsByClassName('btn-prim');
  private loader: HTMLCollectionOf<HTMLElement> = <HTMLCollectionOf<HTMLElement>>document.getElementsByClassName('loader');
  private direction: HTMLCollectionOf<HTMLElement> = <HTMLCollectionOf<HTMLElement>>document.getElementsByClassName('direction');
  private distance: HTMLCollectionOf<HTMLElement> = <HTMLCollectionOf<HTMLElement>>document.getElementsByClassName('distance');

  private joystick;
  private intervalID;
  private sensStatus = 0;
  private initSensor = 0;

  constructor() {  }

  public connect() {
    var i = 0;

    this.helpEl[0].style.display = "none";
    this.loader[0].style.display = "block";
    var menu = <HTMLCollectionOf<HTMLElement>>document.getElementsByClassName('menuButton');
    menu[0].classList.add('inactive');

    this._ws = new WebSocket('ws://192.168.0.1:2609');

    var timeOut = setTimeout(this.timeOutConnect, 3000, this._ws, this.loader[0], menu[0]);

    this._ws.onopen = event => {
      clearTimeout(timeOut);
      this.loader[0].style.display = "none";

      this._ws.onmessage = event => {
        //this.history.push('[SERVER] ' + event.data);
        if (this.initSensor == 0) {
          var jsonData = JSON.parse(event.data);
          var status = jsonData.Sensor;
          if (status.localeCompare('OFF') == 0) {
            this.sensStatus = 0;
          } else this.sensStatus = 1;
          this.evaluateSensStatus();
          this.initSensor++;
        }
      };

      for (i=0; i< this.arrChoose.length; i++) {
        this.arrChoose[i].style.display = "block";
      }
    }

    this._ws.onerror = event => {
      clearTimeout(timeOut);
      this.timeOutConnect(this._ws, this.loader[0], menu[0]);
    }
  }

  public timeOutConnect(ws,loader,menu) {
    ws.close();
    loader.style.display = "none";
    menu.classList.remove('inactive');
    (<HTMLCollectionOf<HTMLElement>>document.getElementsByClassName('error'))[0].style.display = "block";
  }

  public auto() {
    this._ws.send('automatik');
  }

  public man() {
    var i = 0;
    var joyStickDiv = <HTMLCollectionOf<HTMLElement>>document.getElementsByClassName('joyStickDiv');
    var barMotor = <HTMLCollectionOf<HTMLElement>>document.getElementsByClassName('bar-inner');
    this.joystick = new VirtualJoystick({
      container: joyStickDiv[0],
      leftMotor: barMotor[0],
      leftMotorD: barMotor[1],
      rightMotor: barMotor[2],
      rightMotorD: barMotor[3],
      mouseSupport: true,
      stationaryBase: true,
      direction: this.direction[0],
      distance: this.distance[0],
      baseX: 180,
      baseY: 350,
      limitStickTravel: true,
      stickRadius: 90
    });

    this.intervalID = setInterval(this.sendToMotor, 400, this.history, this.joystick, this._ws);

    this._ws.send('manuell');
    //this.history.push('[CLIENT] ' + 'manuell');

    for (i=0; i< this.arrChoose.length; i++) {
      this.arrChoose[i].style.display = "none";
    }
    for (i=0; i< this.arrMan.length; i++) {
      this.arrMan[i].style.display = "block";
    }
  }

  private sendToMotor(historyList, joyStick, webSocket) {
    var message;
    var dir = joyStick.getDirection();
    var dist = joyStick.getDistance();

    //Bereich von 0-90 abgedeckt durch 0-90 [JoyStick]
    //prinzipiell also 1 : 9/9=1
    //JoyStick Wertung in 5er Schritten:
    //0-9   :  0=0x00; 10-18 : 18=0x12
    //19-27 : 27=0x1B; 28-36 : 36=0x24
    //37-45 : 45=0x2D; 46-54 : 54=0x36
    //55-63 : 63=0x3F; 64-72 : 72=0x48
    //73-81 : 81=0x51; 82-90 : 90=0x5A

    var switch_dist = Math.ceil(dist/9);
    if(switch_dist == 1 || switch_dist == 0) {
      dist = 0;
    } else {
      dist = (switch_dist*90)/10;
    }

    if(dist == 0) {
      var string_dist:String = '00';
      var other_motor1:String = '00';
      var other_motor2:String = '00';
    } else {
      var string_dist:String = dist.toString(16).toUpperCase();
      var calc_other_motor = Math.round(dist/3);
      if (calc_other_motor < 7) calc_other_motor = 7;
      var other_motor1:String = calc_other_motor.toString(16).toUpperCase();
      if (other_motor1.length == 1) other_motor1 = '0' + other_motor1;
      calc_other_motor = Math.round(dist/8);
      if (calc_other_motor < 7) calc_other_motor = 7;
      var other_motor2:String = calc_other_motor.toString(16).toUpperCase();
      if (other_motor2.length == 1) other_motor2 = '0' + other_motor2;
    }

    switch(dir) {
      case 'Base':
        message = 'AA-00-55-00';
        break;
      case 'up':
        message = 'AA-' + string_dist + '-55-' + string_dist;
        break;
      case 'up-left':
        message = 'AA-' + other_motor1 + '-55-' + string_dist;
        break;
      case 'up-l-left':
        message = 'AA-' + other_motor2 + '-55-' + string_dist;
        break;
      case 'up-right':
        message = 'AA-' + string_dist + '-55-' + other_motor1;
        break;
      case 'up-r-right':
        message = 'AA-' + string_dist + '-55-' + other_motor2;
        break;
      case 'down':
        message = '55-' + string_dist + '-AA-' + string_dist;
        break;
      case 'down-left':
        message = '55-' + other_motor1 + '-AA-' + string_dist;
        break;
      case 'down-l-left':
        message = '55-' + other_motor2 + '-AA-' + string_dist;
        break;
      case 'down-right':
        message = '55-' + string_dist + '-AA-' + other_motor1;
        break;
      case 'down-r-right':
        message = '55-' + string_dist + '-AA-' + other_motor2;
        break;
      case 'left':
        message = '55-' + string_dist + '-55-' + string_dist;
        break;
      case 'right':
        message = 'AA-' + string_dist + '-AA-' + string_dist;
        break;
      default:
        message = 'send something';
        break;
    }

    webSocket.send(message);
    //historyList.push('[CLIENT] ' + message);
  }

  public clickSens() {
    if (this.sensStatus==0) {
      this._ws.send('sensON');
      this.sensStatus = 1;
    } else {
      this._ws.send('sensOFF');
      this.sensStatus = 0;
    }
    this.initSensor = 0;
  }

  private evaluateSensStatus() {
    var checkBox = <HTMLCollectionOf<HTMLInputElement>>document.getElementsByClassName('checkSens');
    if (this.sensStatus==0) {
      checkBox[0].checked = false;
    } else checkBox[0].checked = true;
  }

  private endWs() {
    var i;
    clearInterval(this.intervalID);
    this._ws.close();

    for (i=0; i< this.arrChoose.length; i++) {
      this.arrChoose[i].style.display = "none";
    }
    this.helpEl[0].style.display = "block";
    var menu = <HTMLCollectionOf<HTMLElement>>document.getElementsByClassName('menuButton');
    menu[0].classList.remove('inactive');
  }

  private back() {
    var i = 0;

    clearInterval(this.intervalID);
    this.joystick.destroy();
    this._ws.send('STOP');
    //this.history.push('[CLIENT] ' + 'STOP');
    for (i=0; i< this.arrMan.length; i++) {
      this.arrMan[i].style.display = "none";
    }
    for (i=0; i< this.arrChoose.length; i++) {
      this.arrChoose[i].style.display = "block";
    }
  }
}
