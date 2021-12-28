import { Subject, BehaviorSubject, ConnectableObservable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { Injectable, Optional, Inject } from '@angular/core';
import { switchMap, map, multicast, tap, filter, catchError, pluck } from 'rxjs/operators';

import { DataLoadingState, Setting } from './data.interface';
import { PAGING_DATA_SETTING } from '../injection';

interface Page{
  pageNo?:number,
  pageSize?: number,
  currentNo?: number,
  total?: number  
}

interface Filter {  
  [prop: string]: any;
}

/*
  对分页数据的请求与处理逻辑可托管给此服务
*/
@Injectable()
export class PagingDataService<D, F = Filter> {  

  private page: Page          = {};
  private filterQuerys: Filter= {};
  private settings: Setting   = {};
  private listCache: D[]      = [];
  private totalNums$          = new Subject<number>();
  private requester$          = new Subject<Filter> ()  
  public  loadingState$       = new BehaviorSubject<DataLoadingState> ('initPending');

  constructor(     
    private http: HttpClient,
    @Optional() @Inject(PAGING_DATA_SETTING) private globalSetting: Setting
  ) {
    this.settings = {
      method: 'post',
      startPage: 1, 
      pageSize: 10,
      pageNames: ['pageNo', 'pageSize'],
      isWaterFall: true, 
      plucker:['data'],
      totalNums: 'total',
      totalName: ['total']
    }
  }  

  // 根据传入的url请求地址，创建并返回列表数据的可观察对象
  create(url: string, querys: Filter = {}, localSetting?: Setting ) {    

    Object.assign(this.settings, this.globalSetting, localSetting)   //合并配置
    this.page.pageNo    = this.settings.startPage   
    this.page.pageSize  = this.settings.pageSize

    const publisher$
      = this.requester$
          .pipe(                    
            tap( _ => this.loadingState$.next(this.getLoadingState(null)) ),
            switchMap( param => {
              const requestMap$ = this.settings.method === 'post' 
                                  ? this.http.post(url, {...querys, ...param})
                                  : this.http.get(url, {params:{...querys, ...param}})
              return requestMap$
                      .pipe(
                        tap( null, _ => this.loadingState$.next(
                          this.page.pageNo === this.settings.startPage ? 'initError' : 'pageError'
                        )),    
                        catchError(_ => new Subject<unknown>())
                      )
            }),  
            filter( res => Boolean(res)) ,       
            tap<any>( res => {
              let total: number, pluck = this.settings.pageInfoPlucker;              
              if(!pluck || !pluck.length) {
                total = res[this.settings.totalNums];
              } else {
                let obj = res;
                pluck.forEach(k => {
                  obj = obj[k];
                  total = obj[this.settings.totalNums] as number;
                })
              }
              this.totalNums$.next( res.data[this.settings.totalNums] )
            }  ) , 
            pluck<unknown, D[]>( ...this.settings.plucker ),
            tap( data => this.loadingState$.next(this.getLoadingState(data.length)) ),             
            filter( data => Boolean(data.length) || (!data.length && this.page.pageNo === this.settings.startPage) ),
            map( data => this.settings.isWaterFall ? this.listCache.concat(data) : data ),            
            tap( data => this.listCache = data),            
            tap( _ => {
              this.page.currentNo = this.page.pageNo
              this.page.pageNo ++
            } ),            
            multicast( new BehaviorSubject([]) )                   
          ) as ConnectableObservable< D[] >

    publisher$.connect()
    this.requestTo()
    return publisher$
  }

  private getLoadingState(length?: number | null): DataLoadingState {
    if(length === null) {
      return this.page.pageNo === this.settings.startPage ? 'initPending' : 'pagePending';
    }
    if(!length && this.page.pageNo === this.settings.startPage) return 'none'    
    if(length && this.page.pageNo === this.settings.startPage){    
      if(length < this.page.pageSize) {
        return 'initEnd'
      } else {
        return 'initSuccess' 
      }             
    }     
    if(length && length === this.page.pageSize) return 'pageSuccess';    
    if(length < this.page.pageSize) return 'end';    
  }

  private requestTo() {
    let pagingQuerys: any = { };
    if(this.settings.useSkip) {
      pagingQuerys.skip   = (this.page.pageNo - this.settings.startPage) * this.settings.pageSize;
      pagingQuerys.limit  = this.page.pageSize;
    } else {
      pagingQuerys[this.settings.pageNames[0]] = this.page.pageNo;
      pagingQuerys[this.settings.pageNames[1]] = this.page.pageSize;
    }
    this.requester$.next({      
      ...pagingQuerys,
      ...this.filterQuerys
    })
  }

  /** 条件筛选 */
  filter(querys: F) {
    this.page.pageNo  = this.settings.startPage; //筛选条件改变时，页码重置
    this.filterQuerys = Object.assign(this.filterQuerys, querys);
    this.listCache    = [];
    if( querys === null ) this.filterQuerys = {};
    this.requestTo();
  }

  // 加载下一页数据
  nextPage() {      
    this.requestTo()
  }

  // 加载上一页数据
  previousPage() {    
    this.page.currentNo > 0 && ( this.page.pageNo = this.page.currentNo - 1 )
    this.requestTo()
  }

  // 加载指定页数据
  gotoPage(num: number) {
    if(!this.settings.isWaterFall) {
      this.page.pageNo = num;
      this.requestTo();
    } else {
      console.error('瀑布流加载的数据不能调用gotoPage方法')
    }    
  }

  /** 保留当前页码及筛选条件下刷新 */
  fresh() {
    if(this.settings.isWaterFall) this.page.pageNo = this.settings.startPage; //瀑布流模式下页码需要重置
    this.requestTo();
  }

  /** 刷新(清除筛选条件及重置页码) */
  refresh() {
    this.filterQuerys = {}; 
    this.listCache    = [];
    this.page.pageNo  = this.settings.startPage;
    this.requestTo();
  }

  /** 获取服务端数据的条目总数 */
  getTotalNums() {
    return this.totalNums$
  }
}
