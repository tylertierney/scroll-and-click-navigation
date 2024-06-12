import { Component, ElementRef, Input } from '@angular/core';

@Component({
  selector: 'pane',
  template: `<ng-content></ng-content>`,
  standalone: true,
  imports: [],
  styleUrls: ['./pane.component.scss'],
})
export class PaneComponent {
  constructor(public elem: ElementRef) {}

  @Input({ required: true }) id = '';
}
