import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { NG_TREATER_SETTINGS, PagingDataModule, NgTreaterSetting } from 'ng-treater';
import { pluck } from 'rxjs/operators';

import { AppComponent } from './app.component';

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    PagingDataModule,
    HttpClientModule
  ],
  providers: [
    {provide: NG_TREATER_SETTINGS, useValue: <NgTreaterSetting>{
      method: 'get',
      paging: {
        start: 1,
        size: 10,
        indexKey: 'pageNo',
        sizeKey: 'pageSize',
        dataPlucker: ['data'],
        totalPlucker: ['total'],
        scrollLoading: false
      }
    }}
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
