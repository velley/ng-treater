import { Directive, EventEmitter, Input, OnChanges, OnInit, Optional, Output, Self, SimpleChanges } from "@angular/core";
import { ConnectableObservable, Observable } from "rxjs";
import { PagingSetting } from "../interface";
import { PagingDataService } from "../paging-data.service";
import { ScrollLoadingDirective } from "../scrollLoading/scroll-loading.directive";

@Directive({
  selector: '[ntPagingContainer]',
  exportAs: 'ntPaging',
  providers: [PagingDataService]
})
export class PagingContainerDirective  implements OnInit, OnChanges {

  /** 请求的url地址 */
  @Input() url!: string | undefined;
  /** 请求时的默认查询参数，该查询参数会固定保存在请求体中，不会被reset重置方法清除 */
  @Input() querys: any = {};
  /** 是否手动控制请求时机，默认为false,初始化时会自动创建paging实例并发送请求 */
  @Input() manual: boolean = false;
  /** 分页请求的相关配置项 */
  @Input() options: Partial<PagingSetting> = {};
  /** 
   * @description 当Input参数变化触发重新请求时指定请求策略
   * fresh: 刷新，保留当前查询条件(但页码重置为初始页)
   * reset: 重置，清除所有查询条件(除默认查询条件querys外)
   * undefined: 仅保存相关参数的改动，不做重新请求操作
   */
  @Input() StragyOnChanges: 'refresh' | 'reset' | undefined;
  @Output() created = new EventEmitter<Observable<any[]>>();

  data$!: ConnectableObservable<any[]>;  

  get state$() {
    return this.paging.loadingState$;
  }

  get total() {
    return this.paging.total;
  }

  get page() {
    return this.paging.page
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
    this.data$ = this.paging.create(this.url, this.querys, {scrollLoading: !!this.scroller, ...this.options, manual: this.manual });
    this.created.emit(this.data$);
  } 

  ngOnChanges(changes: SimpleChanges): void {
    const { querys, url } = changes;
    if(querys) {
      this.paging.changeDefaultQuerys(querys.currentValue, this.StragyOnChanges);
    }

    if(url && !url.isFirstChange) {
      this.paging.changeUrl(url.currentValue, this.StragyOnChanges);
    }
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
    this.paging.fresh();
  }

  refresh() {
    this.paging.refresh()
  }

  reset() {
    this.paging.reset();
  }

  addFilter(params: any) {
    this.paging.addFilter(params);
  }

}