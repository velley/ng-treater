import { Subject, BehaviorSubject, ConnectableObservable, of, Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { Injectable, Optional, Inject } from '@angular/core';
import { switchMap, map, multicast, tap, filter, catchError, pluck, retry } from 'rxjs/operators';
import { NG_TREATER_SETTINGS } from '../injection';
import { DataLoadingEnum, NgTreaterSetting, PagingSetting } from '../interface';

interface Page{
  /** 当前所在页码 */
  pageNo?:number,
  /** 当前页数量 */
  pageSize?: number,  
  /** 数据总量 */
  total?: number,
  /** 目标页码 */
  targetNo?: number
}

interface Filter {  
  [prop: string]: any;
}

const DEFAULT_SETTING: NgTreaterSetting = {
  retryCounter: 1,
  method: 'post',
  paging: {
    dataPlucker: ['data'],
    totalPlucker: ['total'],
    size: 10,
    start: 1,
    indexKey: 'pageNo',
    sizeKey: 'pageSize',
    scrollLoading: false
  }
}

/*
  对分页数据查询的http请求与处理逻辑可托管给此服务
*/
@Injectable()
export class PagingDataService<D, F = Filter> {  
 
  private filters: Filter              = {};
  private settings: NgTreaterSetting   = {};
  private listCache: D[]               = [];  
  private requester$                   = new Subject<Filter> ();
  public  page: Page                   = {};
  public  totalNums$                   = new Observable<number>(); 
  public  loadingState$                = new BehaviorSubject<DataLoadingEnum> (DataLoadingEnum.PENDING);

  get isFirstPage() {
    return this.page.targetNo === this.settings.paging.start;
  }

  constructor(     
    private http: HttpClient,
    @Optional() @Inject(NG_TREATER_SETTINGS) private globalSetting: NgTreaterSetting
  ) {
    this.settings = Object.create(DEFAULT_SETTING);
  }  

  /** 根据传入的url请求地址，创建并返回列表数据的可观察对象 */
  create(url: string, querys: Filter = {}, localPagingSetting?: Partial<PagingSetting>) {    
    // 合并配置
    this.globalSetting && Object.assign(this.settings, this.globalSetting);
    localPagingSetting && Object.assign(this.settings.paging, localPagingSetting);

    // 初始化分页信息
    this.page.pageNo    = this.page.targetNo = this.settings.paging.start;
    this.page.pageSize  = this.settings.paging.size;

    // 创建requeter$与publisher$
    const publisher$
      = this.requester$
          .pipe(                    
            tap( _ =>  this.loadingState$.next(DataLoadingEnum.PENDING)),
            switchMap( param => {
              let requestMap$: Observable<any>;
              switch(this.settings.method) {
                default:
                case 'post':
                  requestMap$ = this.http.post<any>(url, {...querys, ...param});
                break;
                case 'get':
                  requestMap$ = this.http.get<any>(url, {params:{...querys, ...param}});
                break;
              }        
              return requestMap$
                .pipe(
                  retry(this.settings.retryCounter),
                  tap( _ => {
                    //注意：这里是在请求成功后才会更新当前页码值,所以不应在其他方法中更改pageNo
                    this.page.pageNo = param[this.settings.paging.indexKey]; 
                  }, _ => {
                    this.loadingState$.next(DataLoadingEnum.FAILED)
                  }),    
                  catchError(_ => new Subject<unknown>())
                )
            }),  
            // filter( res => Boolean(res)),       
            tap<any>( res => {
              this.totalNums$ = of(res).pipe(pluck(...this.settings.paging.totalPlucker))
            }) , 
            pluck<unknown, D[]>( ...this.settings.paging.dataPlucker || [] ),
            tap( data => this.loadingState$.next(this.getLoadingState(data.length)) ),             
            filter( data => Boolean(data.length) || (!data.length && this.isFirstPage) ),
            map( data => this.settings.paging.scrollLoading ? this.listCache.concat(data) : data ),            
            tap( data => this.listCache = data),
            multicast(new BehaviorSubject([]))                   
          ) as ConnectableObservable< D[] >

    publisher$.connect();
    this.requestTo();
    return publisher$;
  }

  /** 根据服务端返回的列表数据长度和分页信息来得到当前的分页请求状态 */
  private getLoadingState(length?: number): DataLoadingEnum {
    if(length === 0 && this.isFirstPage) return DataLoadingEnum.EMPTY;
    if(length <= this.settings.paging.size) {
      return DataLoadingEnum.SUCCESS
    } else {
      return DataLoadingEnum.END
    }    
  }

  private requestTo() {
    let pagingQuerys: any = { };
    pagingQuerys[this.settings.paging.indexKey] =  this.page.targetNo || this.page.pageNo;
    pagingQuerys[this.settings.paging.sizeKey]  =  this.page.pageSize;
    this.requester$.next({      
      ...pagingQuerys,
      ...this.filters
    })
  }

  /** 添加条件筛选
   * @param querys 需要传入的json筛选对象，传入后筛选数据会被一直保存
   */
  addFilter(querys: F) {
    this.page.pageNo  = this.settings.paging.start; //筛选条件改变时，页码重置为初始值
    this.filters = Object.assign(this.filters, querys);
    this.listCache    = [];
    if( querys === null ) this.filters = {};
    this.requestTo();
  }

  /** 加载下一页数据 */
  nextPage() {      
    this.page.targetNo = this.page.pageNo + 1;
    this.requestTo();
  }

  /** 加载上一页数据(滚动加载场景下无效) */
  previousPage() {    
    if(this.isFirstPage) return;
    this.page.targetNo = this.page.pageNo - 1;
    this.requestTo();
  }

  /** 加载指定页数据(滚动加载场景下无效) */ 
  gotoPage(num: number) {
    if(!this.settings.paging.scrollLoading) {   
      this.page.targetNo = num;   
      this.requestTo();
    } else {
      console.error('滚动加载模式下不能调用gotoPage方法')
    }    
  }

  /** 重试(在某次请求失败时，手动调用此方法重新发送请求) */
  retry() {
    if(this.loadingState$.value === DataLoadingEnum.FAILED) {
      this.requestTo();
    }else {
      console.warn('retry方法仅在请求失败后可用');
    }
  }

  /** 根据已有筛选条件重新请求 */
  fresh() {
    //滚动加载模式下页码与列表数据需要重置
    if(this.settings.paging.scrollLoading) {
      this.page.targetNo = this.settings.paging.start;
      this.listCache   = [];
    } 
    this.requestTo();
  }

  /** 重置(清除筛选条件与重置页码后重新发送数据请求) */
  reset() {
    this.filters      = {}; 
    this.listCache    = [];
    this.page.targetNo  = this.settings.paging.start;
    this.requestTo();
  }

}
