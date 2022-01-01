import { NgModule } from "@angular/core";
import { ScrollLoadingDirective } from './directives/scroll-loading.directive';
import { ShareModule } from "../share/share.module";
import { PagingContainerDirective } from "./directives/pagingContainer.directive";

@NgModule({
  declarations:[
    PagingContainerDirective,
    ScrollLoadingDirective,
  ],  
  imports:[
    ShareModule
  ],
  exports:[
    PagingContainerDirective,
    ScrollLoadingDirective,
    ShareModule  
  ]
}) 
export class PagingDataModule {
  
}