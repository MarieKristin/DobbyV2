import { GraphicsComponent } from './graphics/graphics.component';
import { HomeComponent } from './home/home.component';
import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';

import { AppComponent } from './app.component';
import { WebsocketComponent } from './websocket/websocket.component';
import {appRoutes} from './app.routing';

@NgModule({
  declarations: [
    AppComponent,
    WebsocketComponent,
    HomeComponent, GraphicsComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    HttpModule,
    appRoutes
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
