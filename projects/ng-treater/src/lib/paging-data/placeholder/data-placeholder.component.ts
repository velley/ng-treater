import { Component, Optional, Inject } from '@angular/core';
import { DataLoadingState, Setting } from '../data.interface';
import { PAGING_DATA_SETTING } from '../../injection';
import { PagingDataService } from '../paging-data.service';

@Component({  
  template:`
    <div class="container">
      <img [src]="imgPath">
      <p class="text">{{text}}</p>
      <span class="retry" *ngIf="showRetry && state === 'initError'" (click)="submitRetry()">重试</span>
    </div>    
  `,
  styles:[`
    .container{      
      text-align: center;      
      margin-top: 100px;      
    }
    img{
      max-width: 160px;
    }
    p{
      color: skyblue;
    }
    .retry{
      cursor: pointer;
    }
  `]
})
export class PlaceHolder {
  text: string;
  imgPath: string = null;
  state: DataLoadingState;
  showRetry: boolean;
  constructor(
    @Optional() @Inject(PAGING_DATA_SETTING) private setting: Setting,
    @Optional() private pagingService: PagingDataService<unknown>
  ) {
    this.showRetry = this.setting.retry
  }

  setState(state: DataLoadingState) {
    this.state = state
    switch(state) {
      case 'initPending':
        this.text = this.setting.pendingText || '正在加载...'
        this.imgPath = this.setting.pendingImgPath
      break;
      case 'initError':
        this.text = this.setting.failedText || '加载失败'
        this.imgPath = this.setting.failedImgPath
      break;
      case 'none':
        this.text = this.setting.emptyText || '暂无数据'
        this.imgPath = this.setting.emptyImgPath
      break;
    }
  }

  submitRetry() {
    this.pagingService.nextPage()
  }
}