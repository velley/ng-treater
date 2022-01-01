import { InjectionToken } from '@angular/core';
import { NgTreaterSetting, PagingSetting } from './interface';

export const PAGING_DATA_SETTING = new InjectionToken<PagingSetting>('a config of paging data service');
// export const SIMPLE_DATA_SETTING = new InjectionToken<Setting>('a config of simple data service');
export const NG_TREATER_SETTINGS = new InjectionToken<NgTreaterSetting>('gloabal config of ng-treater');