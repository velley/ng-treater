import { Directive, EventEmitter, Inject, Input, OnDestroy, OnInit, Optional, Output, Self } from "@angular/core";
import { ConnectableObservable } from "rxjs";
import { PagingSetting } from "../../interface";
import { PagingDataService } from "../paging-data.service";
import { ScrollLoadingDirective } from "./scroll-loading.directive";

@Directive({
  selector: '[ntPagingContainer]',
  exportAs: 'ntPaging',
  providers: [PagingDataService]
})
export class PagingContainerDirective  implements OnInit, OnDestroy{

  @Input() url: string;
  @Input() querys: any = {};
  @Input() options: PagingSetting;
  @Output() ready = new EventEmitter();

  data$: ConnectableObservable<unknown[]>;
  controller: PagingDataService<unknown>;

  constructor(
    private paging: PagingDataService<unknown>,
    @Optional() @Self() private scroll: ScrollLoadingDirective //注入该指令仅用作判断当前视图是否需要滚动加载
  ) {

  }

  ngOnInit(): void {
    if(!this.url) {
      console.warn('未传入url请求地址,无法发送分页请求');
      return;
    }
    this.data$ = this.paging.create(this.url, this.querys, {scrollLoading: !!this.scroll});
    this.ready.emit(this.data$);
  } 

  ngOnDestroy(): void {
   
  }

  nextPage() {
    this.paging.nextPage();
  }

  previousPage() {
    this.paging.previousPage()
  }

  gotoPage(index: number) {
    this.paging.gotoPage(index);
  }

  fresh() {
    this.paging.fresh()
  }

  reset() {
    this.paging.reset()
  }

  addFilter(params: any) {
    this.paging.addFilter(params);
  }

}