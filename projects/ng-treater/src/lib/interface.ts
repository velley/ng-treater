import { ComponentRef, TemplateRef, Type } from "@angular/core";
import { BehaviorSubject } from "rxjs";

/** 针对ng-treater/pagingDataWrapper分页查询逻辑的设置项 */
export interface PagingSetting {  
  size: number;
  start: 0 | 1;
  sizeKey: string;
  indexKey: string;  
  dataPlucker: string[];
  totalPlucker: string[];
  /** 是否为滚动加载 */
  scrollLoading: boolean;
}

/** 针对ng-treater的全局设置项 */
export interface NgTreaterSetting {  
  placeholder?: Type<DataLoadingStateTreater>;
  retryCounter?: number;
  method?: 'post' | 'get';
  paging?: PagingSetting;
}

/** 自定义Placeholder组件需要继承的接口 */
export interface DataLoadingStateTreater {
  /** 注册加载状态数据 */
  registerLoadingState: (state: BehaviorSubject<DataLoadingEnum>) => void;
  /** 注册错误重试方法 */
  registerRetryFunc: (fn: any) => void;
}

/** 数据请求状态枚举 */
export enum DataLoadingEnum {
  /** 数据请求中*/
  PENDING = 'pending',
  /** 数据请求成功 */
  SUCCESS = 'success',
  /** 空数据 */
  EMPTY = 'empty',
  /** 请求失败 */
  FAILED  = 'failed',
  /** 请求结束(仅在分页请求场景下有效，表示当前已为最后一页，无法再请求下一页数据) */
  END = 'end'
}
