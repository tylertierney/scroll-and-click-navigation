import {
  ChangeDetectionStrategy,
  Component,
  ContentChildren,
  DestroyRef,
  ElementRef,
  inject,
  QueryList,
  ViewChild,
} from '@angular/core';
import { ActivatedRoute, RouterModule, RouterOutlet } from '@angular/router';
import {
  combineLatest,
  debounceTime,
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
import { NavItemComponent } from './nav-item/nav-item.component';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  selector: 'scrollable-nav',
  templateUrl: './scrollable-nav.component.html',
  styleUrls: ['./scrollable-nav.component.scss'],
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterOutlet, RouterModule, CommonModule, NavItemComponent],
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
    debounceTime(250),
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

  private navItemComponents = new ReplaySubject<QueryList<NavItemComponent>>(1);
  @ContentChildren(NavItemComponent) set _navItemComponents(
    children: QueryList<NavItemComponent>
  ) {
    this.navItemComponents.next(children);
  }

  destroyRef = inject(DestroyRef);

  ngOnInit(): void {
    // On click of a nav-item, scroll to the associated pane
    this.fragment$
      .pipe(withLatestFrom(this.panes$), takeUntilDestroyed(this.destroyRef))
      .subscribe(([fragment, panes]) => {
        const foundPane = panes.find(({ id }) => id === fragment);
        if (!foundPane) return;
        const el = foundPane.elem.nativeElement;
        el.scrollIntoView({ behavior: 'smooth' });
      });

    // Add the active class to the nav-item associated with
    // the currently-scrolled pane
    combineLatest([
      this.currentScrolledElement$,
      this.navItemComponents.pipe(map((navItems) => navItems.toArray())),
    ])
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(([currentScrolledId, navItems]) => {
        navItems.forEach(({ id, elem }) => {
          if (id === currentScrolledId) {
            elem.nativeElement.classList.add('active');
          } else {
            elem.nativeElement.classList.remove('active');
          }
        });
      });
  }
}
