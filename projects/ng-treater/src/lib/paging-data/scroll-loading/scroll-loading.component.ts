import { Component, Optional, SkipSelf } from '@angular/core';
import { DataLoadingState } from '../data.interface';
import { PagingDataService } from '../paging-data.service';

@Component({
  template:`
    <div class="container">
      <span (click)="loadMore()">{{text}}</span>
    </div>    
  `,
  styles:[`
    :host{
      flex: 100%;
      width: 100%;
    }
    .container{      
      flex:1 1;
      margin-top: 15px;
      text-align: center;
      padding: 5px 0;
      min-height: 15px;
      color: #999;
    }
    span{
      cursor:pointer;
    }
  `]  
})
export class ScrollLoadingBox {

  text: string ;
  clickLoad: boolean;

  constructor(
    @Optional() @SkipSelf() private pagingDataService: PagingDataService<unknown>
  ) {}

  loadMore() {
    this.clickLoad && this.pagingDataService.nextPage()
  }
}