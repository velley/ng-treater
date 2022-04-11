import { Component, OnInit } from '@angular/core';
import { NgTreaterSetting, NG_TREATER_SETTINGS } from 'ng-treater';

@Component({
  selector: 'nt-placeholder-basic-example',
  templateUrl: './basic.component.html',
  styleUrls: ['./basic.component.css'],
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
      }
    }}
  ]
})
export class NtPlaceholderBasicExampleComponent implements OnInit {

  constructor() { }

  ngOnInit() {
  }

}
