import { 
  TemplateRef, 
  ViewContainerRef,   
  ComponentFactoryResolver,  
  Optional,
  OnInit,
  Inject,
  Component,
  ViewChild,
  Injector,
  Directive,
  Type,
  ComponentRef
} from '@angular/core';
import { PagingDataService } from '../../paging-data/paging-data.service';
import { NG_TREATER_SETTINGS } from '../../injection';
import { NtLoadingState, DataLoadingStateTreater, NgTreaterSetting } from '../../interface';
import { SimpleDataService } from '../../simple-data/simple-data.service';



@Directive({
  selector: '[ntDataPlaceHolder]'
})
export class DataPlaceHolderDirective implements OnInit  {

  loadingState!: NtLoadingState;
  placeholder!: ComponentRef<DataLoadingStateTreater>;
  dataTreater!: PagingDataService | SimpleDataService;
  @ViewChild('placeholder', {read: TemplateRef}) placeholderTpl!: TemplateRef<any>;
  
  constructor(
    private injector: Injector,
    private templateRef: TemplateRef<any>,
    private viewContainer: ViewContainerRef,
    private cfr: ComponentFactoryResolver,
    @Optional() private paging: PagingDataService<unknown>,
    @Optional() private simple: SimpleDataService,
    @Optional() @Inject(NG_TREATER_SETTINGS) private setting: NgTreaterSetting
  ) {
       
  }

  ngOnInit() {    
    this.dataTreater = this.paging || this.simple;
    if(!this.dataTreater) console.error('未找到PagingDatService或SimpleDataService服务, DataPlaceHolder指令无法生效');
    this.watchLoadingState();
  }

  private watchLoadingState() {    
    this.dataTreater?.loadingState$
      .subscribe( state => {
        this.loadingState = state;
        /** 若当前请求为分页请求，只需要在第一页请求时插入Placeholder占位视图 */
        if(this.paging && !this.paging.isFirstPage) return;
        if([NtLoadingState.PENDING, NtLoadingState.EMPTY, NtLoadingState.FAILED].includes(state)){
          this.viewContainer.clear();
          this.addPlaceholder();
        } else if([NtLoadingState.SUCCESS, NtLoadingState.END].includes(state)) {
          this.viewContainer.clear();
          this.viewContainer.createEmbeddedView(this.templateRef);
        }
      })
  }  

  private addPlaceholder() {
    const state = this.dataTreater.loadingState$.value;    
    const globalTpl  = this.setting.placeholder || PlaceholderComponent;
    const factory    = this.cfr.resolveComponentFactory(globalTpl);
    this.placeholder = factory.create(this.injector);
    this.placeholder.instance.writeState(this.dataTreater.loadingState$.value);
    this.placeholder.instance.registerRetryFunc(() => this.dataTreater.retry());
    this.viewContainer.insert(this.placeholder.hostView);
  }
}

const LOADING_STATE_MAP = {
  'pending': '正在加载...',
  'failed': '加载失败',
  'empty': '暂无数据'
}
@Component({
  template: `    
    <div class="nt-placeholder">{{ loadingTextObj[state] }}</div>    
  `,
  styles:[`
    .nt-placeholder {
      padding-top: 50px;
      text-align: center;
      color: #999;
    }
  `]
})
export class PlaceholderComponent implements DataLoadingStateTreater {
  
  state!: string;
  loadingTextObj = LOADING_STATE_MAP as any;

  retry!: () => void;

  writeState(state: NtLoadingState) {
    this.state = state;
  };

  registerRetryFunc(fn: any) {
    this.retry = fn;
  };
}