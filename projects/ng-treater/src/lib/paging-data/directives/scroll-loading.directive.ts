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
import { NtLoadingState } from '../../interface';
import { PagingDataService } from '../paging-data.service';


@Directive({
  selector: '[ntScrollLoading]',
})
export class ScrollLoadingDirective implements OnInit, OnDestroy {
  
  loadingDom: HTMLElement;
  loadingDomRef: ComponentRef<ScrollLoadingBox>;
  loadingState$: BehaviorSubject<NtLoadingState>; 
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
    this.insertLoadingDom();    
    this.bindScrollEvent();
    this.listenLoading();
  }

  ngOnDestroy() {
    this.end$.next()    
  }

  insertLoadingDom() {
    const factory       = this.cfr.resolveComponentFactory(ScrollLoadingBox)
    this.loadingDom     = document.createElement('loading')
    this.loadingDomRef  = factory.create(this.injector,[],this.loadingDom);
    // 仅在第一次请求后初始化插入底部提示节点
    this.loadingState$
      .pipe(        
        first(state => [NtLoadingState.SUCCESS, NtLoadingState.END, NtLoadingState.FAILED].includes(state))
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
        if([NtLoadingState.PENDING, NtLoadingState.END].includes(this.pagingDataService.loadingState$.value)) return;
        const topIns = this.hostEl.scrollTop
        const bottomIns = this.hostEl.scrollHeight - topIns - this.hostEl.offsetHeight   
        if(bottomIns < 20) {  
          this.pagingDataService.nextPage();
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
        //若当前请求的分页为第一页，应暂时隐藏底部加载提示
        if(this.pagingDataService.isFirstPage) {
          this.loadingDom.style.display = 'none'
        } else {
          this.loadingDom.style.display = 'block';
        };
        switch(state) {
          default:
          case NtLoadingState.SUCCESS:
            this.loadingDomRef.instance.text = '加载更多';
            this.loadingDomRef.instance.clickType = 'more';
          break;
          case NtLoadingState.END:
            this.loadingDomRef.instance.text = '- 已经到底啦 -';  
          break;          
          case NtLoadingState.FAILED:
            this.loadingDomRef.instance.text = '加载失败!';
            this.loadingDomRef.instance.clickType = 'retry';
          break;
          case NtLoadingState.PENDING:
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
      font-size: 14px;
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