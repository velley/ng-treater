import { NgModule } from "@angular/core";
import { DataPlaceHolderDirective } from '../share/directives/placeholder/data-placeholder.directive';
import { PlaceHolder } from '../share/directives/placeholder/data-placeholder.component';
import { ScrollLoadingDirective } from './scroll-loading/scroll-loading.directives';
import { ScrollLoadingBox } from './scroll-loading/scroll-loading.component';
import { CommonModule } from '@angular/common';

@NgModule({
  declarations:[
    DataPlaceHolderDirective,
    ScrollLoadingDirective,
    PlaceHolder,
    ScrollLoadingBox
  ],  
  entryComponents:[
    PlaceHolder,
    ScrollLoadingBox
  ],
  imports:[
    CommonModule
  ],
  exports:[
    DataPlaceHolderDirective,
    ScrollLoadingDirective      
  ]
}) 
export class PagingDataModule {
  
}