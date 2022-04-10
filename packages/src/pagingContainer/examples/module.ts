
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { NG_TREATER_SETTINGS,  NgTreaterSetting, NgTreaterModule } from 'ng-treater';
import { NtPagingContainerBasicExampleComponent } from './basic/basic.component';

import { mock, setup } from 'mockjs'
import { NtPagingContainerPageExampleComponent } from './page/page.component';

import { NzTableModule } from 'ng-zorro-antd/table'
import { NtPagingContainerFilterExampleComponent } from './filter/filter.component';
import { NtPagingContainerServiceExampleComponent } from './service/service.component';
import { NtPagingContainerScrollExampleComponent } from './scroll/scroll.component';

setup({
  timeout: 2000
})

mock(/\/api\/getPagingData/, 'post', {
  'data|10': [
    {
      'name': '@cname', 
      'category': '@ctitle', 
      'rank|1-100': 1,
      'id|+1': 1, 
      'address': '@city',
      'cdt': '@datetime'
    }
  ],
  total: 200
})

@NgModule({
  declarations: [
    NtPagingContainerBasicExampleComponent,
    NtPagingContainerPageExampleComponent,
    NtPagingContainerFilterExampleComponent,
    NtPagingContainerServiceExampleComponent,
    NtPagingContainerScrollExampleComponent
  ],
  imports: [
    CommonModule,
    NgTreaterModule,
    NzTableModule
  ],
  exports: [
    NtPagingContainerBasicExampleComponent,
    NtPagingContainerPageExampleComponent,
    NtPagingContainerFilterExampleComponent,
    NtPagingContainerServiceExampleComponent,
    NtPagingContainerScrollExampleComponent
  ],
  providers: [
    {provide: NG_TREATER_SETTINGS, useValue: <NgTreaterSetting>{
      paging: {
        start: 1,
        size: 10,
        indexKey: 'pageNo',
        sizeKey: 'pageSize',
        dataPlucker: ['data'],
        totalPlucker: ['total'],
        scrollLoading: false,
        method: 'post'
      },
      simple: {
        plucker: ['data'],
        method: 'get'
      }
    }}
  ]
})
export class NtPagingContainerExamplesModule { }