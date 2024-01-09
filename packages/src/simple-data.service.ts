import { Subject, BehaviorSubject, ConnectableObservable, Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { Injectable, Optional, Inject } from '@angular/core';
import { switchMap, multicast, tap, catchError, pluck, retry } from 'rxjs/operators';
import { NG_TREATER_SETTINGS } from './injection';
import { NtLoadingState, NgTreaterSetting, SimpleSetting } from './interface';

interface SimpleQuerys {
  [prop: string]: number | string
}

const DEFAULT_SIMPLE_SETTING = {
  method: 'get',
  plucker: ['data']
}

/*
  对非分页数据查询的http请求与处理逻辑可托管给此服务
*/
@Injectable()
export class SimpleDataService<D = any> {  
 
  private url!: string;
  private settings!: Partial<NgTreaterSetting>;
  private requester$    = new Subject<SimpleQuerys>();
  private querys        = {} as SimpleQuerys;
  public  loadingState$ = new BehaviorSubject<NtLoadingState>(NtLoadingState.PENDING);

  constructor(     
    private http: HttpClient,
    @Optional() @Inject(NG_TREATER_SETTINGS) private globalSetting: NgTreaterSetting
  ) {
    this.settings = {
      retryCounter: 1,      
      simple: {
        method: 'get',
        plucker: ['data']
      }
    };
  }  

  /** 根据传入的url请求地址，向服务端发送请求，并返回可观察对象publisher$
   * @param url 服务端请求地址
   * @param defaultQuerys 默认请求参数(每次请求都会带上该参数，不会被reset方法清空)
   * @param localPagingSetting 本地分页设置，可覆盖全局设置
  */
  create(url: string, defaultQuerys: any = {}, localSetting?: SimpleSetting) {    
    // 初始化配置信息
    const plucker       = localSetting?.plucker || this.globalSetting.simple?.plucker || DEFAULT_SIMPLE_SETTING.plucker;    
    const method        = localSetting?.method || this.globalSetting.simple?.method || DEFAULT_SIMPLE_SETTING.method;   
    const retryCounter  = this.globalSetting.retryCounter || 0; 

    // 创建requeter$与publisher$
    const publisher$
      = this.requester$
          .pipe(                    
            tap( _ =>  this.loadingState$.next(NtLoadingState.PENDING)),
            switchMap( querys => {
              let requestMap$: Observable<any>;
              switch(method) {                
                case 'post':
                  requestMap$ = this.http.post<any>(url, {...defaultQuerys, ...querys});
                break;
                default:
                case 'get':
                  requestMap$ = this.http.get<any>(url, {params:{...defaultQuerys, ...querys}});
                break;
              }        
              return requestMap$
                .pipe(
                  retry(this.settings.retryCounter),
                  tap( _ => {
                    this.loadingState$.next(NtLoadingState.SUCCESS)
                  }, _ => {
                    this.loadingState$.next(NtLoadingState.FAILED)
                  }),    
                  catchError(_ => new Subject<unknown>())
                )
            }),  
            pluck<unknown, never[]>( ...plucker),    
            multicast(new BehaviorSubject([]))                   
          ) as Observable<unknown> as ConnectableObservable<D>

    publisher$.connect();
    this.requestTo();
    return publisher$;
  }

  private requestTo() {
    this.requester$.next(this.querys)
  }

  /** 重试 */
  retry() {
    if(this.loadingState$.value === NtLoadingState.FAILED) {
      this.requestTo();
    }else {
      console.warn('retry方法仅在请求失败后可用');
    }
  }

  /** 刷新请求 */
  fresh(querys?: SimpleQuerys) { 
    if(querys) this.querys = Object.assign(this.querys, querys)
    this.requestTo();
  }
}
