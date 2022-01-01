import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DataPlaceHolderDirective } from './directives/data-placeholder.directive';



@NgModule({
  declarations: [
    DataPlaceHolderDirective
  ],
  imports: [
    CommonModule
  ],
  exports: [
    CommonModule,
    DataPlaceHolderDirective
  ]
})
export class ShareModule { }
