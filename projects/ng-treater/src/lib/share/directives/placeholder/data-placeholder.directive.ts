import { 
  TemplateRef, 
  ViewContainerRef,   
  ComponentFactoryResolver,  
  Optional,
  OnInit,
  Inject,
  Component,
  ViewChild
} from '@angular/core';
import { PagingDataService } from '../../../paging-data/paging-data.service';
import { NG_TREATER_SETTINGS } from '../../../injection';
import { NgTreaterSetting } from '../../../interface';
import { DataLoadingState } from 'dist/ng-treater/lib/paging-data/data.interface';

const LOADING_STATE_MAP = {
  'initPending': '正在加载...',
  'initError': '加载失败',
  'none': '暂无数据'
}

@Component({
  selector: '[ntDataPlaceHolder]',
  template: `
    <ng-template #defaultTpl>
      <div class="nt-placeholder">
        {{ loadingTextObj[loadingState] }}
      </div>
    </ng-template>
  `,
  styles:[`
    .nt-placeholder {
      padding-top: 50px;
    }
  `]
})
export class DataPlaceHolderDirective implements OnInit  {

  loadingState: DataLoadingState;
  loadingTextObj = LOADING_STATE_MAP;
  @ViewChild('defaultTpl', {read: TemplateRef}) defaultTpl: TemplateRef<any>;
  
  constructor(
    private templateRef: TemplateRef<any>,
    private viewContainer: ViewContainerRef,
    private cfr: ComponentFactoryResolver,
    @Optional() private PagingDataService: PagingDataService<unknown>,
    @Optional() @Inject(NG_TREATER_SETTINGS) private setting: NgTreaterSetting
  ) {
       
  }

  ngOnInit() {    
    if(!this.PagingDataService) console.error('未找到PagingDatService服务, DataPlaceHolder指令无法生效');
    this.watchLoadingState()
  }

  private watchLoadingState() {    
    this.PagingDataService?.loadingState$
      .subscribe( state => {
        this.loadingState = state;
        if(['initPending', 'initError', 'none'].includes(state)){
          this.addPlaceholder(state);
        } else if(['initSuccess', 'initEnd'].includes(state)) {
          this.viewContainer.clear()
          this.viewContainer.createEmbeddedView(this.templateRef)
        }
      })
  }  

  private addPlaceholder(state:  DataLoadingState) {
    const globalTpl = this.setting.placeholder || this.defaultTpl;
    if(globalTpl instanceof TemplateRef) {
      this.viewContainer.createEmbeddedView(globalTpl, {state});
    } else {
      const factory = this.cfr.resolveComponentFactory(globalTpl);
      this.viewContainer.createComponent(factory);
    }
  }
}

