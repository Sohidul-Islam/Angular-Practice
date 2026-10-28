import { Component, input } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

export interface NavLink {
  id: number;
  label: string;
  url: string;
}

@Component({
  selector: 'app-nav-item',
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './nav-item.html',
  styleUrl: './nav-item.css',
})
export class NavItem {
  readonly navItems = input.required<NavLink[]>();
}
