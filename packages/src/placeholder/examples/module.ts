
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { NG_TREATER_SETTINGS,  NgTreaterSetting, NgTreaterModule } from 'ng-treater';

import { mock, setup } from 'mockjs'
import { NtPlaceholderBasicExampleComponent } from './basic/basic.component';
import { NzEmptyModule } from 'ng-zorro-antd/empty';
import { DataPlaceholderComponent } from './custome/dataPlaceholder.component';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { NtPlaceholderCustomeExampleComponent } from './custome/custome.component';


setup({
  timeout: 3000
})

mock(/\/api\/getPagingData2/, 'post', () => {
  const rand = Math.random();
  if(rand>0.5) {
    return mock({
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
  } else {
    return {
      data: [],
      total: 0
    }
  }
})

@NgModule({
  declarations: [
    NtPlaceholderBasicExampleComponent,
    NtPlaceholderCustomeExampleComponent,
    DataPlaceholderComponent
  ],
  imports: [
    CommonModule,
    NgTreaterModule,
    NzEmptyModule,
    NzSpinModule
  ],
  exports: [
    NtPlaceholderBasicExampleComponent,
    NtPlaceholderCustomeExampleComponent,
  ],
  providers: [
    {provide: NG_TREATER_SETTINGS, useValue: <NgTreaterSetting>{
      placeholder: DataPlaceholderComponent,
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
export class NtPlaceholderExamplesModule { }