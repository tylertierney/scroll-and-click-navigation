import {
  ChangeDetectionStrategy,
  Component,
  ContentChildren,
  ElementRef,
  inject,
  Input,
  QueryList,
  ViewChild,
} from '@angular/core';
import { ActivatedRoute, RouterModule, RouterOutlet } from '@angular/router';
import {
  filter,
  fromEvent,
  map,
  Observable,
  ReplaySubject,
  switchMap,
  withLatestFrom,
} from 'rxjs';
import { CommonModule } from '@angular/common';
import { PaneComponent } from './pane/pane.component';

@Component({
  selector: 'scrollable-nav',
  templateUrl: './scrollable-nav.component.html',
  styleUrls: ['./scrollable-nav.component.scss'],
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterOutlet, RouterModule, CommonModule],
})
export class ScrollableNavComponent {
  mainElementSubject = new ReplaySubject<ElementRef<HTMLDivElement>>(1);
  @ViewChild('mainElement', { read: ElementRef }) set mainElement(
    vc: ElementRef<HTMLDivElement>
  ) {
    this.mainElementSubject.next(vc);
  }

  private paneComponentsSubject = new ReplaySubject<QueryList<PaneComponent>>(
    1
  );
  @ContentChildren(PaneComponent) set _paneComponents(
    children: QueryList<PaneComponent>
  ) {
    this.paneComponentsSubject.next(children);
  }

  panes$ = this.paneComponentsSubject.pipe(
    map((queryList) => queryList.toArray())
  );

  activatedRoute = inject(ActivatedRoute);

  fragment$: Observable<string> = this.activatedRoute.fragment.pipe(
    filter(Boolean)
  );

  mainElement$: Observable<HTMLDivElement> = this.mainElementSubject.pipe(
    filter(Boolean),
    map((el) => el.nativeElement)
  );

  scroll$: Observable<Event> = this.mainElement$.pipe(
    switchMap((mainElement) => fromEvent<Event>(mainElement, 'scroll'))
  );

  currentScrolledElement$ = this.scroll$.pipe(
    switchMap(() => this.mainElement$),
    withLatestFrom(this.paneComponentsSubject),

    map(([mainElement, panes]) => {
      const scrollPosition = mainElement.scrollTop;

      for (const { id, elem } of panes) {
        const nativeElement = elem.nativeElement;
        const { offsetTop } = nativeElement;
        const { height } = nativeElement.getBoundingClientRect();
        if (offsetTop + height >= scrollPosition + 20) {
          return id;
        }
      }

      return '';
    })
  );

  ngOnInit(): void {
    this.fragment$
      .pipe(withLatestFrom(this.panes$))
      .subscribe(([fragment, panes]) => {
        const foundPane = panes.find(({ id }) => id === fragment);
        if (!foundPane) return;
        const el = foundPane.elem.nativeElement;
        el.scrollIntoView({ behavior: 'smooth' });
      });
  }
}
