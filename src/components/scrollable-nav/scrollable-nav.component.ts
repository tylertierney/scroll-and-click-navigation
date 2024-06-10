import {
  ChangeDetectionStrategy,
  Component,
  ContentChild,
  ContentChildren,
  Directive,
  ElementRef,
  inject,
  Input,
  QueryList,
  ViewChild,
} from '@angular/core';
import { ActivatedRoute, RouterModule, RouterOutlet } from '@angular/router';
import {
  combineLatest,
  filter,
  fromEvent,
  map,
  Observable,
  of,
  ReplaySubject,
  switchMap,
  tap,
  withLatestFrom,
} from 'rxjs';
import { CommonModule } from '@angular/common';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { PaneComponent } from './pane.component';

type ElementRefMap = Record<string, ElementRef<HTMLDivElement>>;

@Component({
  selector: 'scrollable-nav',
  templateUrl: './scrollable-nav.component.html',
  styleUrls: ['./scrollable-nav.component.scss'],
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterOutlet, RouterModule, CommonModule, ReactiveFormsModule],
})
export class ScrollableNavComponent {
  @Input() navItems: string[] = [];

  mainElementSubject = new ReplaySubject<ElementRef<HTMLDivElement>>(1);
  @ViewChild('mainElement', { read: ElementRef }) set mainElement(
    vc: ElementRef<HTMLDivElement>
  ) {
    this.mainElementSubject.next(vc);
  }

  // firstThingSubject = new ReplaySubject<ElementRef<HTMLParagraphElement>>(1);
  // @ViewChild('firstThing', { read: ElementRef }) set firstThing(
  //   vc: ElementRef<HTMLParagraphElement>
  // ) {
  //   this.firstThingSubject.next(vc);
  // }

  // secondThingSubject = new ReplaySubject<ElementRef<HTMLParagraphElement>>(1);
  // @ViewChild('secondThing', { read: ElementRef }) set secondThing(
  //   vc: ElementRef<HTMLParagraphElement>
  // ) {
  //   this.secondThingSubject.next(vc);
  // }

  // thirdThingSubject = new ReplaySubject<ElementRef<HTMLParagraphElement>>(1);
  // @ViewChild('thirdThing', { read: ElementRef }) set thirdThing(
  //   vc: ElementRef<HTMLParagraphElement>
  // ) {
  //   this.thirdThingSubject.next(vc);
  // }

  // elementRefs$: Observable<ElementRefMap> = combineLatest({
  //   firstThing: this.firstThingSubject,
  //   secondThing: this.secondThingSubject,
  //   thirdThing: this.thirdThingSubject,
  // });

  // private paneElementRefsSubject = new ReplaySubject<
  //   QueryList<ElementRef<PaneComponent>>
  // >(1);
  // @ContentChildren(PaneComponent, { read: ElementRef }) set _paneElementRefs(
  //   children: QueryList<ElementRef<PaneComponent>>
  // ) {
  //   this.paneElementRefsSubject.next(children);
  // }

  private paneComponentsSubject = new ReplaySubject<QueryList<PaneComponent>>(
    1
  );
  @ContentChildren(PaneComponent) set _paneComponents(
    children: QueryList<PaneComponent>
  ) {
    this.paneComponentsSubject.next(children);
  }

  private panes$ = this.paneComponentsSubject.pipe(
    map((queryList) => queryList.map((x) => x))
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
    withLatestFrom(this.panes$),

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
    // this.fragment$
    //   .pipe(withLatestFrom(this.elementRefs$))
    //   .subscribe(([fragment, elementRefs]) => {
    //     if (fragment in elementRefs) {
    //       const el = elementRefs[fragment]?.nativeElement;
    //       el?.scrollIntoView({ behavior: 'smooth' });
    //     }
    //   });
    // this.fragment$.pipe(
    //   withLatestFrom(this.pan)
    // )
  }

  formGroup = new FormGroup({
    name: new FormControl<string>('', { nonNullable: true }),
    favoriteColor: new FormControl<string>('', { nonNullable: true }),
    city: new FormControl<string>('', { nonNullable: true }),
  });
}
