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
import { CommonModule } from '@angular/common';

type ElementRefMap = Record<string, ElementRef<HTMLDivElement>>;

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterModule, CommonModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent implements OnInit {
  mainElementSubject = new ReplaySubject<ElementRef<HTMLDivElement>>(1);
  @ViewChild('mainElement', { read: ElementRef }) set mainElement(
    vc: ElementRef<HTMLDivElement>
  ) {
    this.mainElementSubject.next(vc);
  }

  firstThingSubject = new ReplaySubject<ElementRef<HTMLParagraphElement>>(1);
  @ViewChild('firstThing', { read: ElementRef }) set firstThing(
    vc: ElementRef<HTMLParagraphElement>
  ) {
    this.firstThingSubject.next(vc);
  }

  secondThingSubject = new ReplaySubject<ElementRef<HTMLParagraphElement>>(1);
  @ViewChild('secondThing', { read: ElementRef }) set secondThing(
    vc: ElementRef<HTMLParagraphElement>
  ) {
    this.secondThingSubject.next(vc);
  }

  thirdThingSubject = new ReplaySubject<ElementRef<HTMLParagraphElement>>(1);
  @ViewChild('thirdThing', { read: ElementRef }) set thirdThing(
    vc: ElementRef<HTMLParagraphElement>
  ) {
    this.thirdThingSubject.next(vc);
  }

  elementRefs$: Observable<ElementRefMap> = combineLatest({
    firstThing: this.firstThingSubject,
    secondThing: this.secondThingSubject,
    thirdThing: this.thirdThingSubject,
  });

  activatedRoute = inject(ActivatedRoute);

  fragment$ = this.activatedRoute.fragment.pipe(filter(Boolean));

  mainElement$ = this.mainElementSubject.pipe(
    filter(Boolean),
    map((el) => el.nativeElement)
  );

  scroll$ = this.mainElement$.pipe(
    switchMap((mainElement) => fromEvent<Event>(mainElement, 'scroll'))
  );

  currentScrolledElement$ = this.scroll$.pipe(
    switchMap(() => this.mainElement$),
    withLatestFrom(this.elementRefs$),
    map(([mainElement, elementRefs]) => {
      const scrollPosition = mainElement.scrollTop;

      for (const [name, element] of Object.entries(elementRefs)) {
        const nativeElement = element.nativeElement;

        const { height } = nativeElement.getBoundingClientRect();

        if (nativeElement.offsetTop + height >= scrollPosition + 20) {
          return name;
        }
      }
      return '';
    })
  );

  ngOnInit(): void {
    this.fragment$
      .pipe(withLatestFrom(this.elementRefs$))
      .subscribe(([fragment, elementRefs]) => {
        if (fragment in elementRefs) {
          const el = elementRefs[fragment]?.nativeElement as HTMLElement;
          el.scrollIntoView({ behavior: 'smooth' });
        }
      });

    // this.scroll$
    //   .pipe(
    //     switchMap(() => this.mainElement$),
    //     withLatestFrom(this.elementRefs$)
    //   )
    //   .subscribe(([mainElement, elementRefs]) => {
    //     const scrollPosition = mainElement.scrollTop;

    //     for (const [name, element] of Object.entries(elementRefs)) {
    //       const nativeElement = element.nativeElement;

    //       const { height } = nativeElement.getBoundingClientRect();

    //       if (nativeElement.offsetTop + height >= scrollPosition + 20) {
    //         console.log(name);
    //         break;
    //       }
    //     }
    //   });
  }
}
