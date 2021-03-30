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
  private filters: Filter     = {};
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
      totalNums: 'total'  
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
            tap<any>( res => this.totalNums$.next( res.data[this.settings.totalNums] ) ) , 
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
      return this.page.pageNo === this.settings.startPage ? 'initPending' : 'pagePending'
    }
    if(!length && this.page.pageNo === this.settings.startPage) return 'none'    
    if(length && this.page.pageNo === this.settings.startPage){    
      if(length < this.page.pageSize) {
        return 'initEnd'
      } else {
        return 'initSuccess' 
      }             
    }     
    if(length && length === this.page.pageSize) return 'pageSuccess'    
    if(length < this.page.pageSize) return 'end'    
  }

  private requestTo() {
    this.requester$.next({      
      [this.settings.pageNames[0]]: this.page.pageNo,
      [this.settings.pageNames[1]]: this.page.pageSize,
      ...this.filters
    })
  }

  // 条件筛选
  filter(querys: F) {
    this.page.pageNo  = this.settings.startPage
    this.filters      = Object.assign(this.filters, querys)    
    this.listCache    = []
    if( querys === null ) this.filters = {}   
    this.requestTo()
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
    this.page.pageNo = num
    this.requestTo()
  }

  // 刷新(重新从第一页请求数据)
  refresh() {
    this.filters = {} 
    this.listCache   = []
    this.page.pageNo = this.settings.startPage 
    this.requestTo()
  }

  // 获取服务端数据的条目总数
  getTotalNums() {
    return this.totalNums$
  }
}
