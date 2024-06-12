import { NgClass } from '@angular/common';
import { Component, ElementRef, Input } from '@angular/core';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'nav-item',
  templateUrl: './nav-item.component.html',
  standalone: true,
  imports: [NgClass, RouterModule],
  styleUrls: ['./nav-item.component.scss'],
  host: {
    role: 'listitem',
  },
})
export class NavItemComponent {
  constructor(public elem: ElementRef) {}

  @Input({ required: true }) id = '';
}
