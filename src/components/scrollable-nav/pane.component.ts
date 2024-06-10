import { Component, ElementRef, Input } from '@angular/core';

@Component({
  selector: 'pane',
  template: `<ng-content></ng-content>`,
  standalone: true,
  imports: [],
  host: { style: 'min-height: 100%' },
})
export class PaneComponent {
  constructor(public elem: ElementRef) {}
  // @Input({ required: true }) urlFragment = '';
  @Input({ required: true }) label = '';
  @Input({ required: true }) id = '';
}
