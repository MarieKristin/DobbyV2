import {Routes, RouterModule} from '@angular/router';
import {HomeComponent} from './home/home.component';
import {WebsocketComponent} from './websocket/websocket.component';
import {GraphicsComponent} from './graphics/graphics.component';

const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    redirectTo: '/home'
  },
  {
    path: 'home',
    component: HomeComponent
  },
  {
    path: 'websocket',
    component: WebsocketComponent
  },
  {
    path: 'graphics',
    component: GraphicsComponent
  }
];

export const appRoutes = RouterModule.forRoot(routes, { useHash: true });
