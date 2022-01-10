import { Directive, EventEmitter, Input, OnInit, Optional, Output, Self } from "@angular/core";
import { ConnectableObservable, Observable } from "rxjs";
import { PagingSetting } from "../../interface";
import { PagingDataService } from "../paging-data.service";
import { ScrollLoadingDirective } from "./scroll-loading.directive";

@Directive({
  selector: '[ntPagingContainer]',
  exportAs: 'ntPaging',
  providers: [PagingDataService]
})
export class PagingContainerDirective  implements OnInit{

  @Input() url!: string;
  @Input() querys: any = {};
  @Input() options: Partial<PagingSetting> = {};
  @Output() created = new EventEmitter<Observable<any[]>>();

  data$!: ConnectableObservable<any[]>;  

  get state$() {
    return this.paging.loadingState$
  }

  get total() {
    return this.paging.total;
  }
  
  constructor(
    private paging: PagingDataService,
    @Optional() @Self() private scroller: ScrollLoadingDirective //注入该指令仅用来判断宿主视图是否可滚动加载
  ) {}

  ngOnInit(): void {
    if(!this.url) {
      console.warn('未传入url地址,PagingContainerDirective内部无法发送分页请求');
      return;
    }
    this.data$ = this.paging.create(this.url, this.querys, {scrollLoading: !!this.scroller, ...this.options });
    this.created.emit(this.data$);
  } 

  nextPage() {
    this.paging.nextPage();
  }

  previousPage() {
    this.paging.previousPage();
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