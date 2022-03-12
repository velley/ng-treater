import { Directive, EventEmitter, Input, OnInit, Output } from "@angular/core";
import { ConnectableObservable, Observable } from "rxjs";
import { SimpleDataService } from "./simple-data.service";

@Directive({
  selector: '[ntsimpleContainer]',
  exportAs: 'ntsimple',
  providers: [SimpleDataService]
})
export class simpleContainerDirective implements OnInit{

  @Input() url!: string;
  @Input() querys: any = {};
  @Input() options: {method?: 'post'|'get'} = {};
  @Output() created = new EventEmitter<Observable<any[]>>();

  data$!: ConnectableObservable<any>;  

  get state$() {
    return this.simple.loadingState$;
  }
  
  constructor(
    private simple: SimpleDataService,
  ) {}

  ngOnInit(): void {
    if(!this.url) {
      console.warn('未传入url地址,simpleContainerDirective内部无法发送数据请求');
      return;
    }
    this.data$ = this.simple.create(this.url, this.querys, this.options);
    this.created.emit(this.data$);
  } 

  fresh() {
    this.simple.fresh()
  }
}