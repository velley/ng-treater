import { Component, OnInit } from '@angular/core';
import { PagingDataService } from 'ng-treater';

@Component({
  selector: 'nt-pagingContainer-service-example',
  templateUrl: './service.component.html',
  styleUrls: ['./service.component.scss'],
  providers: [PagingDataService]
})
export class NtPagingContainerServiceExampleComponent implements OnInit {

  data: any[] = [];

  get total() {
    return this.paging.total
  }

  get isLoading() {
    return this.paging.loadingState$.value === 'pending'
  }

  constructor(
    private paging: PagingDataService
  ) { }

  ngOnInit() {
    this.paging.create('/api/getPagingData')
      .subscribe(data => {
        this.data = data.map(el => {
          return {...el, name: 'name-'+el.name}
        })
      })
  }

  gotoPage(index: number) {
    this.paging.gotoPage(index)
  }

}
