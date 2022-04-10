import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PagingContainerDirective } from './pagingContainer/pagingContainer.directive';
import { SimpleContainerDirective } from './simpleContainer/simpleContainer.directive';
import { ScrollLoadingDirective } from './scrollLoading/scroll-loading.directive';
import { DataPlaceHolderDirective } from './placeholder/data-placeholder.directive';

@NgModule({
  imports: [
    CommonModule
  ],
  declarations: [
    PagingContainerDirective,
    SimpleContainerDirective,
    ScrollLoadingDirective,
    DataPlaceHolderDirective
  ],
  exports: [
    PagingContainerDirective,
    SimpleContainerDirective,
    ScrollLoadingDirective,
    DataPlaceHolderDirective
  ]
})
export class NgTreaterModule { }
