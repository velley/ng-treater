import { ComponentRef, TemplateRef, Type } from "@angular/core";

/** 针对ng-treater/pagingDataWrapper分页查询逻辑的设置项 */
export interface PagingSetting {
  plucker: string[];
  sizeKey: string;
  indexKey: string;
  totalKey: string;
  /** 是否为滚动加载 */
  scrollLoading: boolean;
}

/** 针对ng-treater的全局设置项 */
export interface NgTreaterSetting<C = unknown> {  
  placeholder: TemplateRef<any> | Type<C>;
  retry: number;
  httpMethod: 'post' | 'get';
  paging: PagingSetting;
}