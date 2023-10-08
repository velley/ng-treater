import { Subject, BehaviorSubject, ConnectableObservable, of, Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { Injectable, Optional, Inject } from '@angular/core';
import { switchMap, map, multicast, tap, filter, catchError, pluck, retry } from 'rxjs/operators';
import { NG_TREATER_SETTINGS } from '../injection';
import { NtLoadingState, NgTreaterSetting, PagingSetting } from '../interface';

export interface Page{
  /** 初始页码索引 */
  start: number,
  /** 当前所在页码 */
  pageIndex:number,
  /** 当前页数量 */
  pageSize: number,  
  /** 数据总量 */
  total: number,
  /** 目标页码(指即将发送请求的页码) */
  targetNo: number,
  /** 页数字段名称 */
  indexKey: string,
  /** 页码长度字段名称 */
  sizeKey: string
  /** 是否为滚动分页加载 */
  scrollLoading: boolean
}

interface Filter {  
  [prop: string]: string | number | boolean | ReadonlyArray<string | number | boolean>;
}

const DEFAULT_PAGE_SETTING: PagingSetting = {
  method: 'post',
  dataPlucker: ['data'],
  totalPlucker: ['total'],
  size: 10,
  start: 1,
  indexKey: 'pageIndex',
  sizeKey: 'pageSize',
  scrollLoading: false
};

/*
  对分页数据查询的http请求与处理逻辑可托管给此服务
*/
@Injectable()
export class PagingDataService<D = any, F = Filter> {  
 
  private filters: Filter              = {};
  private listCache: D[]               = [];  
  private requester$                   = new Subject<Filter>();
  private publisher$!: ConnectableObservable<D[]>;
  public  page!: Page;
  public  total: number                = 0;
  public  loadingState$                = new BehaviorSubject<NtLoadingState>(NtLoadingState.PENDING);

  get isFirstPage() {
    return this.page?.targetNo === DEFAULT_PAGE_SETTING.start;
  }

  constructor(     
    private http: HttpClient,
    @Optional() @Inject(NG_TREATER_SETTINGS) private globalSetting: NgTreaterSetting
  ) {    
  }  

  /** 
   * @description 1.根据传入的url请求地址，向服务端发送请求，并返回可观察对象publisher$，该对象为订阅者提供请求返回的数据(数据结果取决于NgTreaterSetting.paging.dataPlucker的配置)
   * @description 2.该请求基于angular httpClient,所以应用中通过HTTP_INCERPT提供的请求拦截器依然对该请求生效
   * @param url 服务端请求地址
   * @param defaultQuerys 默认请求参数(每次请求都会带上该参数，不会被reset方法清空)
   * @param localPagingSetting 本地分页设置，可覆盖全局设置
  */
  create(url: string, defaultQuerys: Filter = {}, localPagingSetting?: Partial<PagingSetting>) {   
    
    if(this.publisher$) {
      console.warn('在单个实例中PagingDataService.create方法只能调用一次');
      return this.publisher$;
    }

    // 初始化分页配置信息
    this.page = {} as Page;
    this.page.start         = localPagingSetting?.start || this.globalSetting.paging?.start || DEFAULT_PAGE_SETTING.start;
    this.page.pageIndex     = this.page.targetNo = localPagingSetting?.size || this.globalSetting.paging?.size || DEFAULT_PAGE_SETTING.size;
    this.page.pageSize      = localPagingSetting?.start || this.globalSetting.paging?.start || 1;
    this.page.indexKey      = localPagingSetting?.indexKey || this.globalSetting.paging?.indexKey || DEFAULT_PAGE_SETTING.indexKey;
    this.page.sizeKey       = localPagingSetting?.sizeKey || this.globalSetting.paging?.sizeKey || DEFAULT_PAGE_SETTING.sizeKey;
    this.page.scrollLoading = localPagingSetting?.scrollLoading || this.globalSetting.paging?.scrollLoading || DEFAULT_PAGE_SETTING.scrollLoading;

    const dataPlucker   = localPagingSetting?.dataPlucker || this.globalSetting.paging?.dataPlucker || DEFAULT_PAGE_SETTING.dataPlucker;
    const totalPlucker  = localPagingSetting?.totalPlucker || this.globalSetting.paging?.totalPlucker || DEFAULT_PAGE_SETTING.totalPlucker;    
    const method        = localPagingSetting?.method || this.globalSetting.paging?.method || DEFAULT_PAGE_SETTING.method;   
    const retryCounter  = this.globalSetting.retryCounter || 0; 

    // 创建requeter$与publisher$
    this.publisher$
      = this.requester$
          .pipe(                    
            tap( _ =>  this.loadingState$.next(NtLoadingState.PENDING)),
            switchMap(param => {
              let requestMap$: Observable<any>;              
              switch(method) {
                default:
                case 'post':
                  requestMap$ = this.http.post<any>(url, {...defaultQuerys, ...param});
                break;
                case 'get':
                  requestMap$ = this.http.get<any>(url, {params: {...defaultQuerys, ...param}});
                break;
              }        
              return requestMap$
                .pipe(
                  retry(retryCounter),
                  tap( _ => {
                    //注意：这里是在请求成功后才会更新当前页码值,所以不应在其他方法中更改pageIndex
                    this.page.pageIndex = param[this.page.indexKey] as number; 
                  }, _ => {
                    this.loadingState$.next(NtLoadingState.FAILED)
                  }),    
                  catchError(_ => new Subject<unknown>())
                )
            }),    
            tap<any>( res => {              
              of(res).pipe(pluck<unknown, number>(...totalPlucker))
                .subscribe(num => this.total = num)
            }), 
            pluck<unknown, D[]>( ...dataPlucker || [] ),
            tap( data => this.loadingState$.next(this.getLoadingState(data.length)) ),             
            filter( data => Boolean(data.length) || (!data.length && this.isFirstPage) ),
            map( data => this.page.scrollLoading ? this.listCache.concat(data) : data ),            
            tap( (data: any) => this.listCache = data,),
            multicast(new BehaviorSubject([]))                   
          ) as Observable<unknown> as ConnectableObservable<D[]>

    this.publisher$.connect();
    this.requestTo();
    return this.publisher$;
  }

  /** 根据服务端返回的列表数据长度和分页信息来得到当前的请求状态 */
  private getLoadingState(length: number): NtLoadingState {
    if(length === 0 && this.isFirstPage) return NtLoadingState.EMPTY;
    if(length === this.page.pageSize) {
      return NtLoadingState.SUCCESS
    } else if(length < this.page.pageSize) {
      return NtLoadingState.END
    } else {
      return NtLoadingState.SUCCESS
    }
  }

  private requestTo() {
    let pagingQuerys: any = { };
    pagingQuerys[this.page.indexKey] =  this.page.targetNo || this.page.pageIndex;
    pagingQuerys[this.page.sizeKey]  =  this.page.pageSize;
    this.requester$.next({      
      ...pagingQuerys,
      ...this.filters
    })
  }

  /** 添加查询条件
   * @param querys 需要传入的json查询对象，传入后会被一直保存(可调用reset方法清空)
   */
  addFilter(querys: F) {
    this.page.targetNo  = this.page.start; //筛选条件改变时，页码重置为初始值
    this.filters = Object.assign(this.filters, querys);
    this.listCache    = [];
    if( querys === null ) this.filters = {};
    this.requestTo();
  }

  /** 加载下一页数据 */
  nextPage() {      
    this.page.targetNo = this.page.pageIndex + 1;
    this.requestTo();
  }

  /** 加载上一页数据(滚动加载场景下无效) */
  previousPage() {    
    if(this.isFirstPage) return;
    this.page.targetNo = this.page.pageIndex - 1;
    this.requestTo();
  }

  /** 加载指定页数据(滚动加载场景下无效) */ 
  gotoPage(num: number) {
    if(!this.page.scrollLoading) {   
      this.page.targetNo = num;   
      this.requestTo();
    } else {
      console.error('滚动加载模式下不能调用gotoPage方法')
    }    
  }

  /** 改变页码长度(pageSize) */
  changeSize(size: number) {
    this.page.pageIndex   = this.page.start;
    this.page.pageSize = size;
    this.requestTo();
  }

  /** 重试(在某次请求失败时，手动调用此方法重新发送请求) */
  retry() {
    if(this.loadingState$.value === NtLoadingState.FAILED) {
      this.requestTo();
    }else {
      console.warn('retry方法仅在请求失败后可用');
    }
  }

  /** 根据已有查询条件重新请求(页码不变) */
  fresh() {
    //滚动加载模式下页码与列表数据需要重置
    if(this.page?.scrollLoading) {
      this.page.targetNo = this.page.start;
      this.listCache   = [];
    } 
    this.requestTo();
  }

  /** 重置(清除查询条件并重置页码，重新发送数据请求) */
  reset() {
    this.filters      = {}; 
    this.listCache    = [];
    this.page.targetNo  = this.page?.start;
    this.requestTo();
  }

}
