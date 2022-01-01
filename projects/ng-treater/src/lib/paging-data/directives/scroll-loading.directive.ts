import { 
  Directive, 
  Component,
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
import { BehaviorSubject, fromEvent, Subject } from 'rxjs';
import { debounceTime, takeUntil, distinctUntilChanged, first } from 'rxjs/operators';
import { DataLoadingEnum } from '../../interface';
import { PagingDataService } from '../paging-data.service';


@Directive({
  selector: '[ntScrollLoading]',
})
export class ScrollLoadingDirective implements OnInit, OnDestroy {
  
  loadingDom: HTMLElement;
  loadingDomRef: ComponentRef<ScrollLoadingBox>;
  loadingState$: BehaviorSubject<DataLoadingEnum>; 
  end$ = new Subject()

  constructor(
    private el: ElementRef,
    private cfr: ComponentFactoryResolver,
    private appRef: ApplicationRef,
    private injector: Injector,
    @Optional() private pagingDataService: PagingDataService<unknown>
  ) {    
    this.loadingState$  = this.pagingDataService?.loadingState$    
  }

  get hostEl() {
    return this.el.nativeElement
  } 

  ngOnInit() {
    if(!this.pagingDataService) console.error('未找到PagingDatService服务, ScrollLoading指令无法生效')
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
    this.loadingDomRef  = factory.create(this.injector,[],this.loadingDom);
    // 在加载第一页数据成功后，再初始化插入底部提示 
    this.loadingState$
      .pipe(        
        first(state => [DataLoadingEnum.SUCCESS, DataLoadingEnum.END, DataLoadingEnum.FAILED].includes(state))
      ).subscribe( _ => {
        this.appRef.attachView(this.loadingDomRef.hostView);
        this.hostEl.appendChild(this.loadingDom);        
      })
  }

  bindScrollEvent() {        
    fromEvent(this.hostEl,'scroll')
      .pipe(
        debounceTime(350),        
        takeUntil(this.end$)
      )
      .subscribe( _ => {        
        if(this.pagingDataService.loadingState$.value === DataLoadingEnum.PENDING) return;
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
        if(this.pagingDataService.isFirstPage && state === DataLoadingEnum.PENDING) {
          this.loadingDom.style.display = 'none'
        } else {
          this.loadingDom.style.display = 'block';
        };
        switch(state) {
          default:
          case DataLoadingEnum.SUCCESS:
            this.loadingDomRef.instance.text = '加载更多';
            this.loadingDomRef.instance.clickType = 'more';
          break;
          case DataLoadingEnum.END:
            this.loadingDomRef.instance.text = '- 已经到底啦 -';  
          break;          
          case DataLoadingEnum.FAILED:
            this.loadingDomRef.instance.text = '加载失败!';
            this.loadingDomRef.instance.clickType = 'retry';
          break;
          case DataLoadingEnum.PENDING:
            this.loadingDomRef.instance.text = '加载中...';
          break;
        }
      })    
  }
}

@Component({
  template:`
    <div class="container">
      <span (click)="onClick()">{{text}}</span>
    </div>    
  `,
  styles:[`
    :host{
      flex: 100%;
      width: 100%;
    }
    .container{      
      flex:1 1;
      margin-top: 15px;
      text-align: center;
      padding: 5px 0;
      min-height: 15px;
      color: #999;
    }
    span{
      cursor:pointer;
    }
  `]  
})
export class ScrollLoadingBox {

  text: string ;
  clickType: 'more' | 'retry';

  constructor(
    @Optional() @SkipSelf() private pagingDataService: PagingDataService<unknown>
  ) {}

  onClick() {
    if(!this.clickType) return;
    this.clickType === 'more' ? this.pagingDataService.nextPage() : this.pagingDataService.retry();
  }
}