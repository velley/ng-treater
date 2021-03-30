import { 
  Directive, 
  ComponentFactoryResolver, 
  ApplicationRef, 
  Injector, 
  ElementRef,   
  ComponentRef, 
  OnInit,
  OnDestroy,
  Optional,  
  SkipSelf
} from '@angular/core';
import { fromEvent, Subject } from 'rxjs';
import { debounceTime, takeUntil, distinctUntilChanged, filter, take } from 'rxjs/operators';
import { DataLoadingState } from '../data.interface';
import { PagingDataService } from '../paging-data.service';
import { ScrollLoadingBox } from './scroll-loading.component'

type state = DataLoadingState
@Directive({
  selector: '[ntScrollLoading]',
})
export class ScrollLoadingDirective implements OnInit, OnDestroy {
  
  loadingDom: HTMLElement;
  loadingDomRef: ComponentRef<ScrollLoadingBox>;
  loadingState$: Subject<state>; 
  end$ = new Subject()

  constructor(
    private el: ElementRef,
    private cfr: ComponentFactoryResolver,
    private appRef: ApplicationRef,
    private injector: Injector,
    @Optional() @SkipSelf() private pagingDataService: PagingDataService<unknown>
  ) {    
    this.loadingState$  = this.pagingDataService?.loadingState$    
  }

  get hostEl() {
    return this.el.nativeElement
  } 

  ngOnInit() {
    if(!this.pagingDataService) console.error('未找到ListDatService服务, ScrollLoading指令无法生效')
    this.insertLoadingDom()    
    this.bindScrollEvent()
    this.listenLoading()
  }

  ngOnDestroy() {
    this.end$.next()    
  }

  insertLoadingDom() {
    const factory       = this.cfr.resolveComponentFactory(ScrollLoadingBox)
    this.loadingDom     = document.createElement('loading')
    this.loadingDomRef  = factory.create(this.injector,[],this.loadingDom)   
    // 在加载第一页数据成功后，再初始化插入底部提示 
    this.loadingState$
      .pipe(
        filter( state => ['initEnd','initSuccess'].includes(state)),
        take(1)
      ).subscribe( _ => {
        this.appRef.attachView(this.loadingDomRef.hostView)
        this.hostEl.appendChild(this.loadingDom)
      })
  }

  bindScrollEvent() {        
    fromEvent(this.hostEl,'scroll')
      .pipe(
        debounceTime(250),        
        takeUntil(this.end$)
      )
      .subscribe( _ => {        
        const topIns = this.hostEl.scrollTop
        const bottomIns = this.hostEl.scrollHeight - topIns - this.hostEl.offsetHeight   
        if(bottomIns < 20) {  
          this.pagingDataService.nextPage()
        } 
      })    
  }

  listenLoading() {        
    this.loadingState$
      .pipe(        
        distinctUntilChanged(),        
        takeUntil(this.end$)
      )
      .subscribe(state => {
        switch(state) {
          default:
          case 'initSuccess':
          case 'pageSuccess':
            this.loadingDomRef.instance.text = '加载更多';
            this.loadingDomRef.instance.clickLoad = true;
          break;
          case 'initEnd':
          case 'end':
            this.loadingDomRef.instance.text = '- 已经到底啦 -';  
          break;          
          case 'pageError':
            this.loadingDomRef.instance.text = '加载失败!';
          break;
          case 'pagePending':
            this.loadingDomRef.instance.text = '加载中...';
          break;
        }
      })    
  }
}

