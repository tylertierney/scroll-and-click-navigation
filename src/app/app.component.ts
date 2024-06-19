import { Component, ElementRef } from '@angular/core';
import { RouterModule, RouterOutlet } from '@angular/router';
import { CommonModule, NgFor } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { ScrollableNavComponent } from '../components/scrollable-nav/scrollable-nav.component';
import { PaneComponent } from '../components/scrollable-nav/pane/pane.component';
import { NavItemComponent } from '../components/scrollable-nav/nav-item/nav-item.component';

const randomUpTo255 = () => {
  return Math.floor(Math.random() * 256);
};

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterOutlet,
    RouterModule,
    CommonModule,
    ReactiveFormsModule,
    ScrollableNavComponent,
    NgFor,
    PaneComponent,
    NavItemComponent,
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent {
  randomNumber = ~~(Math.random() * 30) + 2;

  navItems: { id: string }[] = new Array(this.randomNumber)
    .fill(null)
    .map((_, i) => ({
      id: String(i),
    }));

  panes: { id: string; color: string }[] = new Array(this.randomNumber)
    .fill(null)
    .map((_, i) => ({
      id: String(i),
      color: `rgb(${randomUpTo255()}, ${randomUpTo255()}, ${randomUpTo255()})`,
    }));
}
