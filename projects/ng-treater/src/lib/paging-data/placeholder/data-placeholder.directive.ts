import { 
  Directive, 
  TemplateRef, 
  ViewContainerRef,   
  ComponentFactoryResolver,  
  Optional,
  OnInit,
  Injector,
  ComponentRef
} from '@angular/core';
import { PagingDataService } from '../paging-data.service';
import { filter, take, tap } from 'rxjs/operators';
import { PlaceHolder } from './data-placeholder.component';


@Directive({
  selector: '[ntDataPlaceHolder]'  
})
export class DataPlaceHolderDirective implements OnInit  {

  PlaceHolderComponent: ComponentRef<PlaceHolder>;
  
  constructor(
    private templateRef: TemplateRef<any>,
    private viewContainer: ViewContainerRef,
    private inject: Injector,
    private cr: ComponentFactoryResolver,
    @Optional() private PagingDataService: PagingDataService<unknown> 
  ) {
       
  }

  ngOnInit() {    
    if(!this.PagingDataService) console.error('未找到pagingDatService服务, DataPlaceHolder指令无法生效')
    this.watchLoadingState()
  }

  watchLoadingState() {    
    this.PagingDataService?.loadingState$
      .pipe(
        filter( state => ['initPending', 'initError', 'none'].includes(state) ),
        tap( state => {      
          this.viewContainer.clear()
          const factory = this.cr.resolveComponentFactory(PlaceHolder)   
          this.PlaceHolderComponent = factory.create(this.inject,[])
          this.PlaceHolderComponent.instance.setState(state)
          this.viewContainer.insert(this.PlaceHolderComponent.hostView)          
        } ) 
      )
      .subscribe()
    this.PagingDataService?.loadingState$
      .pipe(
        filter( state => ['initSuccess', 'initEnd'].includes(state)),        
        tap( _ => {        
          console.log(_)  
          this.viewContainer.clear()
          this.viewContainer.createEmbeddedView(this.templateRef)
        }) 
      )
      .subscribe()    
  }  

}

