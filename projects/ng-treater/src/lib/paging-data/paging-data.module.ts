import { NgModule } from "@angular/core";
import { ScrollLoadingDirective } from './directives/scroll-loading.directive';
import { NtShareModule } from "../share/share.module";
import { PagingContainerDirective } from "./directives/pagingContainer.directive";

@NgModule({
  declarations:[
    PagingContainerDirective,
    ScrollLoadingDirective,
  ],  
  imports:[
    NtShareModule
  ],
  exports:[
    PagingContainerDirective,
    ScrollLoadingDirective,
    NtShareModule  
  ]
}) 
export class PagingDataModule {
  
}