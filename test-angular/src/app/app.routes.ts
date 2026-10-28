import { Routes } from '@angular/router';
import { Home } from './pages/home/home';
import { Products } from './pages/products/products';
import { About } from './pages/about/about';
import { Contact } from './pages/contact/contact';
import { RxjsPage } from './pages/rxjs/rxjs';

export const routes: Routes = [
  { path: '', component: Home },
  { path: 'rxjs', component: RxjsPage },
  { path: 'products', component: Products },
  { path: 'about', component: About },
  { path: 'contact', component: Contact },
  { path: '**', redirectTo: '' },
];
