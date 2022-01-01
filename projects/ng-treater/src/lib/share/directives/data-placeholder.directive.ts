import { 
  TemplateRef, 
  ViewContainerRef,   
  ComponentFactoryResolver,  
  Optional,
  OnInit,
  Inject,
  Component,
  ViewChild,
  Injector
} from '@angular/core';
import { PagingDataService } from '../../paging-data/paging-data.service';
import { NG_TREATER_SETTINGS } from '../../injection';
import { DataLoadingEnum, NgTreaterSetting } from '../../interface';

const LOADING_STATE_MAP = {
  'initPending': '正在加载...',
  'initError': '加载失败',
  'none': '暂无数据'
}

@Component({
  selector: '[ntDataPlaceHolder]',
  template: `
    <ng-template #placeholder>
      <div class="nt-placeholder">{{ loadingTextObj[loadingState] }}</div>
    </ng-template>
  `,
  styles:[`
    .nt-placeholder {
      padding-top: 50px;
    }
  `]
})
export class DataPlaceHolderDirective implements OnInit  {

  loadingState: DataLoadingEnum;
  loadingTextObj = LOADING_STATE_MAP;
  @ViewChild('placeholder', {read: TemplateRef}) placeholderTpl: TemplateRef<any>;
  
  constructor(
    private injector: Injector,
    private templateRef: TemplateRef<any>,
    private viewContainer: ViewContainerRef,
    private cfr: ComponentFactoryResolver,
    @Optional() private paging: PagingDataService<unknown>,
    @Optional() @Inject(NG_TREATER_SETTINGS) private setting: NgTreaterSetting
  ) {
       
  }

  ngOnInit() {    
    if(!this.paging) console.error('未找到PagingDatService服务, DataPlaceHolder指令无法生效');
    this.watchLoadingState()
  }

  private watchLoadingState() {    
    this.paging?.loadingState$
      .subscribe( state => {
        this.loadingState = state;
        /** 只需要在第一页请求时插入Placeholder占位视图 */
        if(!this.paging.isFirstPage) return;
        if([DataLoadingEnum.PENDING, DataLoadingEnum.EMPTY, DataLoadingEnum.FAILED].includes(state)){
          this.addPlaceholder();
        } else if([DataLoadingEnum.SUCCESS, DataLoadingEnum.END].includes(state)) {
          this.viewContainer.clear()
          this.viewContainer.createEmbeddedView(this.templateRef);
        }
      })
  }  

  private addPlaceholder() {
    const globalTpl = this.setting.placeholder || this.placeholderTpl;
    if(globalTpl instanceof TemplateRef) {
      this.viewContainer.createEmbeddedView(globalTpl, {state: this.loadingState});
    } else {
      const factory = this.cfr.resolveComponentFactory(globalTpl);
      const component = factory.create(this.injector);
      component.instance.registerLoadingState(this.paging.loadingState$);
      component.instance.registerRetryFunc(() => this.paging.retry());
      this.viewContainer.insert(component.hostView);
    }
  }
}

