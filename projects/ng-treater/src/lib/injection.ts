import { InjectionToken } from '@angular/core';
import { NgTreaterSetting } from './interface';
import { Setting } from './paging-data/data.interface';

export const PAGING_DATA_SETTING = new InjectionToken<Setting>('a config of paging data service');
export const SIMPLE_DATA_SETTING = new InjectionToken<Setting>('a config of simple data service');
export const NG_TREATER_SETTINGS = new InjectionToken<NgTreaterSetting>('gloabal config of ng-treater');