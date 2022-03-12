import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DataPlaceHolderDirective, PlaceholderComponent } from './directives/data-placeholder.directive';



@NgModule({
  declarations: [
    DataPlaceHolderDirective,
    PlaceholderComponent
  ],
  imports: [
    CommonModule
  ],
  exports: [
    CommonModule,
    DataPlaceHolderDirective
  ]
})
export class NtShareModule { }
