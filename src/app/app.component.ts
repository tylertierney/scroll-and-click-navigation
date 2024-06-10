import {
  Component,
  ElementRef,
  inject,
  OnInit,
  TemplateRef,
  ViewChild,
} from '@angular/core';
import {
  ActivatedRoute,
  Router,
  RouterModule,
  RouterOutlet,
} from '@angular/router';
import {
  combineLatest,
  filter,
  from,
  fromEvent,
  map,
  Observable,
  ReplaySubject,
  scan,
  switchMap,
  withLatestFrom,
} from 'rxjs';
import { routes } from './app.routes';
import { CommonModule, NgFor } from '@angular/common';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { ScrollableNavComponent } from '../components/scrollable-nav/scrollable-nav.component';
import { PaneComponent } from '../components/scrollable-nav/pane/pane.component';

type ElementRefMap = Record<string, ElementRef<HTMLDivElement>>;

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
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent {
  formGroup = new FormGroup({
    name: new FormControl<string>('', { nonNullable: true }),
    favoriteColor: new FormControl<string>('', { nonNullable: true }),
    city: new FormControl<string>('', { nonNullable: true }),
  });
}
