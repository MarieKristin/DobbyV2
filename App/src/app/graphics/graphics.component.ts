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
  private loader: HTMLCollectionOf<HTMLElement> = <HTMLCollectionOf<HTMLElement>>document.getElementsByClassName('loader');

  constructor(sanitizer: DomSanitizer) {
    //this.url = sanitizer.bypassSecurityTrustResourceUrl('http://192.168.0.1/modell/index.html');
    this.url = sanitizer.bypassSecurityTrustResourceUrl('http://192.168.0.1:2209/stream_simple.html');

  }

  public ngAfterViewInit() {
    var ws = new WebSocket('ws://192.168.0.1:2609');

    ws.onopen = event => {
      clearTimeout(timeOutConnect);

      ws.onmessage = event => {
        clearTimeout(timeOut);
        this.loader[0].style.display = "none";
        (<HTMLCollectionOf<HTMLElement>>document.getElementsByClassName('successFrame'))[0].style.display = "block";
        ws.close();
      };

      ws.send('test');
      var timeOut = setTimeout(this.errorHappened, 3000, ws, document, this.loader[0]);
    }

    ws.onerror = event => {
      clearTimeout(timeOutConnect);
      this.errorHappened(ws, document, this.loader[0]);
    }

    var timeOutConnect = setTimeout(this.errorHappened, 3000, ws, document, this.loader[0]);
  }

  public errorHappened(ws, document, loader) {
    loader.style.display = "none";
    (<HTMLCollectionOf<HTMLElement>>document.getElementsByClassName('errorDiv'))[0].style.display = "block";
    ws.close();
  }
}
