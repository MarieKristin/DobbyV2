import { Component, OnInit, AfterViewInit } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements AfterViewInit{
  private menu:HTMLCollectionOf<HTMLElement> = <HTMLCollectionOf<HTMLElement>>document.getElementsByClassName('menu');
  private buttonMenu:HTMLCollectionOf<HTMLElement> = <HTMLCollectionOf<HTMLElement>>document.getElementsByClassName('menuButton');
  private menuElements:HTMLCollectionOf<HTMLElement> = <HTMLCollectionOf<HTMLElement>>document.getElementsByClassName('linkEl');

  public ngAfterViewInit() {
    var firstElement = <HTMLCollectionOf<HTMLElement>>document.getElementsByClassName('linkEl');
    firstElement[0].classList.toggle('menuActive');
  }

  public menuClicked() {
    if(this.buttonMenu[0].classList.contains('inactive')) {
      //doNothing -> button is inactive
    } else {
      var menu = this.menu[0];
      menu.classList.toggle('open');
    }
  }

  public menuLinkClicked(linkElement) {
    var menu = this.menu[0];
    var el = <HTMLCollectionOf<HTMLElement>>document.getElementsByClassName('menuActive');
    el[0].classList.toggle('menuActive');
    this.menuElements[linkElement].classList.toggle('menuActive');
    menu.classList.toggle('open');
  }
}
