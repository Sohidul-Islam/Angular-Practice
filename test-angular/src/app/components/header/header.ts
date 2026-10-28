import { Component, signal } from '@angular/core';
import { NavItem, NavLink } from '../nav-item/nav-item';

@Component({
  selector: 'app-header',
  imports: [NavItem],
  templateUrl: './header.html',
  styleUrl: './header.css',
})
export class Header {
  protected readonly siteName = signal('My Angular App');
  protected readonly count = signal(0);
  protected readonly isLoggedIn = signal(false);


  protected readonly headersLink = signal<NavLink[]>([
    { id: 1, label: 'Home', url: '/' },
    { id: 2, label: 'RxJS Guide', url: '/rxjs' },
    { id: 3, label: 'Products', url: '/products' },
    { id: 4, label: 'About', url: '/about' },
    { id: 5, label: 'Contact', url: '/contact' },
  ]);

  // ২. Methods / Events
  increment(): void {
    this.count.update((val) => val + 1);
  }

  toggleLogin() {
    this.isLoggedIn.update((prev) => !prev)
  }


}
