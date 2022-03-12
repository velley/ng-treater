import { Type } from "@angular/core";

/** 针对ng-treater/pagingDataWrapper分页查询逻辑的设置项 */
export interface PagingSetting {  
  /** 每页条数 */
  size: number;
  /** 起始页索引 */
  start: 0 | 1;
  /** 每页条数的键名 */
  sizeKey: string;
  /** 当前页索引的键名 */
  indexKey: string;  
  /** 访问列表数据的属性路径 */
  dataPlucker: string[];
  /** 访问总条数的属性路径 */
  totalPlucker: string[];
  /** 是否为滚动加载 */
  scrollLoading: boolean;
}

/** 针对ng-treater的全局设置项 */
export interface NgTreaterSetting {  
  placeholder?: Type<DataLoadingStateTreater>;
  retryCounter?: number;
  method?: 'post' | 'get';
  simple?: {
    plucker: string[];
  }
  paging: PagingSetting;
}

/** 自定义Placeholder组件需要继承的接口 */
export interface DataLoadingStateTreater {
  /** 写入当前加载状态 */
  writeState(state: NtLoadingState): void;
  /** 注册错误重试方法 */
  registerRetryFunc(fn: any): void;
}

/** 数据请求状态枚举 */
export enum NtLoadingState {
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
