import {Routes, RouterModule} from '@angular/router';
import {HomeComponent} from './home/home.component';
import {ConsoleComponent} from './console/console.component';
import {ConnectComponent} from './connect/connect.component';
import {GraphicsComponent} from './graphics/graphics.component';
import {ImpressumComponent} from './impressum/impressum.component';

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
    path: 'console',
    component: ConsoleComponent
  },
  {
    path: 'connect',
    component: ConnectComponent
  },
  {
    path: 'graphics',
    component: GraphicsComponent
  },
  {
    path: 'impressum',
    component: ImpressumComponent
  }
];

export const appRoutes = RouterModule.forRoot(routes, { useHash: true });
