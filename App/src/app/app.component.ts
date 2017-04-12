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

    this.menu[0].addEventListener('touchstart', this.handleTouchStart, false);
    this.menu[0].addEventListener('mousedown', this.handleTouchStart, false);
    this.menu[0].addEventListener('touchmove', this.handleTouchMove, false);
    this.menu[0].addEventListener('mousemove', this.handleTouchMove, false);
    var attrX = document.createAttribute("paramx");
    attrX.value = null;
    this.menu[0].setAttributeNode(attrX);
    var attrY = document.createAttribute("paramy");
    attrY.value = null;
    this.menu[0].setAttributeNode(attrY);
  }

  private handleTouchStart(event) {
    event.target.setAttribute('paramx', event.touches[0].clientX.toString());
    event.target.setAttribute('paramy', event.touches[0].clientY.toString());
  }

  private handleTouchMove(event) {
    var x = parseInt(event.target.getAttribute('paramx'));
    var y = parseInt(event.target.getAttribute('paramy'));

    if (!x || !y) return;

    var xUp = event.touches[0].clientX;
    var yUp = event.touches[0].clientY;

    var xDiff = x - xUp;
    var yDiff = y - yUp;
    if (Math.abs(xDiff) > Math.abs(yDiff) && xDiff > 0) {
      var menu = <HTMLCollectionOf<HTMLElement>>document.getElementsByClassName('menu');
      menu[0].classList.toggle('open');
      var buttonMenu = <HTMLCollectionOf<HTMLElement>>document.getElementsByClassName('menuButton');
      buttonMenu[0].classList.toggle('active');
    }
    event.target.setAttribute('paramx', null);
    event.target.setAttribute('paramy', null);
  }

  public menuClicked() {
    if(this.buttonMenu[0].classList.contains('inactive')) {
      //doNothing -> button is inactive
    } else {
      var menu = this.menu[0];
      menu.classList.toggle('open');
      this.buttonMenu[0].classList.toggle('active');
    }
  }

  public menuLinkClicked(linkElement) {
    var menu = this.menu[0];
    var el = <HTMLCollectionOf<HTMLElement>>document.getElementsByClassName('menuActive');
    el[0].classList.toggle('menuActive');
    this.menuElements[linkElement].classList.toggle('menuActive');
    menu.classList.toggle('open');
    this.buttonMenu[0].classList.toggle('active');
  }
}
