import { NgModule } from '@angular/core';
import { NtShareModule } from '../share/share.module';
import { SimpleContainerDirective } from './simpleContainer.directive';



@NgModule({
  declarations: [SimpleContainerDirective],
  imports: [
    NtShareModule
  ],
  exports: [
    SimpleContainerDirective
  ]
})
export class SimpleDataModule { }
