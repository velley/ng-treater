import { Directive, EventEmitter, Inject, Input, OnDestroy, OnInit, Output } from "@angular/core";
import { ConnectableObservable } from "rxjs";
import { PagingSetting } from "../../interface";
import { PagingDataService } from "../paging-data.service";

@Directive({
  selector: '[ntPagingContainer]',
  exportAs: 'ntPagingContainer',
  providers: [PagingDataService]
})
export class PagingContainerDirective  implements OnInit, OnDestroy{

  @Input() url: string;
  @Input() querys: any = {};
  @Input() options: PagingSetting;
  @Output() ready = new EventEmitter();

  data$: ConnectableObservable<unknown[]>;
  controller: PagingDataService<unknown>;

  constructor(
    private paging: PagingDataService<unknown>
  ) {

  }

  ngOnInit(): void {
    if(!this.url) {
      console.warn('未传入url请求地址,无法发送分页请求');
      return;
    }
    this.data$ = this.paging.create(this.url, this.querys);
    this.ready.emit(this.data$);
  } 

  ngOnDestroy(): void {
   
  }

  nextPage() {
    this.paging.nextPage();
  }

  previousPage() {
    this.paging.previousPage()
  }

  gotoPage(index: number) {
    this.paging.gotoPage(index);
  }

  fresh() {
    this.paging.fresh()
  }

  reset() {
    this.reset()
  }

  addFilter(params: any) {
    this.paging.addFilter(params);
  }

}