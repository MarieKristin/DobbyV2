//import {Component, OnInit} from '@angular/core';
import {Component, OnInit, AfterViewInit} from '@angular/core';
import {SafeResourceUrl, DomSanitizer} from '@angular/platform-browser';

@Component({
  selector: 'app-graphics',
  templateUrl: './graphics.component.html',
  styleUrls: ['./graphics.component.css']
})
export class GraphicsComponent implements AfterViewInit {
  url: SafeResourceUrl;

  constructor(sanitizer: DomSanitizer) {
    this.url = sanitizer.bypassSecurityTrustResourceUrl('http://192.168.0.1/www/html/index.html');
  }

  public ngAfterViewInit() {
    var ws = new WebSocket('ws://192.168.0.1:2609');

    ws.onopen = event => {
      ws.onmessage = event => {
        clearTimeout(timeOut);
        (<HTMLCollectionOf<HTMLElement>>document.getElementsByClassName('successFrame'))[0].style.display = "block";
        ws.close();
      };

      ws.send('test');
      var timeOut = setTimeout(this.errorHappened, 3000, ws, document);
    }

    ws.onerror = event => {
      this.errorHappened(ws, document);
    }
  }

  public errorHappened(ws, document) {
    (<HTMLCollectionOf<HTMLElement>>document.getElementsByClassName('errorDiv'))[0].style.display = "block";
    ws.close();
  }
}
