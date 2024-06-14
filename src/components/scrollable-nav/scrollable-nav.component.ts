import {
  ChangeDetectionStrategy,
  Component,
  ContentChildren,
  DestroyRef,
  ElementRef,
  inject,
  Input,
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
  Subject,
  switchMap,
  withLatestFrom,
} from 'rxjs';
import { CommonModule } from '@angular/common';
import { PaneComponent } from './pane/pane.component';
import { NavItemComponent } from './nav-item/nav-item.component';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

export const scrollToPaneGivenAnId = ([fragment, panes]: [
  string,
  Array<PaneComponent>
]): void => {
  const foundPane = panes.find(({ id }) => id === fragment);
  if (!foundPane) return;
  const el = foundPane.elem.nativeElement;
  el.scrollIntoView({ behavior: 'smooth' });
};

@Component({
  selector: 'scrollable-nav',
  templateUrl: './scrollable-nav.component.html',
  styleUrls: ['./scrollable-nav.component.scss'],
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterOutlet, RouterModule, CommonModule, NavItemComponent],
})
export class ScrollableNavComponent {
  destroyRef = inject(DestroyRef);

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

  private navItemComponents = new ReplaySubject<QueryList<NavItemComponent>>(1);
  @ContentChildren(NavItemComponent) set _navItemComponents(
    children: QueryList<NavItemComponent>
  ) {
    this.navItemComponents.next(children);
  }

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

  @Input() useUrlFragment = true;

  navItemClickedSubject = new Subject<string>();

  ngOnInit(): void {
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

    // On click of a nav-item, scroll to the associated pane
    if (this.useUrlFragment) {
      // Changes to the url fragment will trigger the scroll
      this.fragment$
        .pipe(withLatestFrom(this.panes$), takeUntilDestroyed(this.destroyRef))
        .subscribe(scrollToPaneGivenAnId);
    } else {
      //
      // Apply click handlers to nav-items +
      // manually set the useUrlFragment input value
      this.navItemComponents.subscribe((navItems) => {
        navItems.toArray().forEach((navItem) => {
          navItem.useUrlFragment = false;
          navItem.elem.nativeElement.addEventListener('click', () => {
            this.navItemClickedSubject.next(navItem.id);
          });
        });
      });

      // Clicks on nav-items will trigger the scroll
      this.navItemClickedSubject
        .pipe(withLatestFrom(this.panes$), takeUntilDestroyed(this.destroyRef))
        .subscribe(scrollToPaneGivenAnId);
    }
  }
}
