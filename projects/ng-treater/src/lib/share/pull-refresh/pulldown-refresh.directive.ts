import { 
  Directive,   
  ComponentFactoryResolver, 
  Injector, 
  ElementRef, 
  Component, 
  ComponentRef, 
  OnInit,
  OnDestroy,
} from '@angular/core';
import { fromEvent } from 'rxjs';
import { filter, switchMapTo, takeUntil } from 'rxjs/operators';

@Directive({
  selector: '[ntPullDownRefresh]',
})
export class PullDownFreshDirective implements OnInit, OnDestroy {

  freshIconComponent: ComponentRef<RefreshIcon>;

  constructor(
    private el: ElementRef,
    private cfr: ComponentFactoryResolver,
    private injector: Injector,

  ) {}

  get hostEl() {
    return this.el.nativeElement
  }

  ngOnInit() {
    this.watchEvent()
  }

  ngOnDestroy() {

  } 

  watchEvent() {
    const scroll$ = fromEvent(this.hostEl, 'scroll')
    const touch$  = fromEvent(this.hostEl, 'touchmove')     
    const over$   = fromEvent(document.body, 'touchend')
    scroll$
      .pipe(
        filter( _ => this.hostEl.scrollTop < 1),
        switchMapTo(touch$),
        takeUntil(over$)
      )   
  }
}

@Component({
  template: `
    <div></div>
  `
})
class RefreshIcon {

}