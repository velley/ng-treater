import { InjectionToken } from '@angular/core';
import { Setting } from './paging-data/data.interface';

export const PAGING_DATA_SETTING = new InjectionToken<Setting>('a config of paging data service');
export const SIMPLE_DATA_SETTING = new InjectionToken<Setting>('a config of simple data service');