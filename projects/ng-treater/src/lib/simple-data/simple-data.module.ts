import { NgModule } from '@angular/core';
import { ShareModule } from '../share/share.module';
import { simpleContainerDirective } from './simpleContainer.directive';



@NgModule({
  declarations: [simpleContainerDirective],
  imports: [
    ShareModule
  ]
})
export class SimpleDataModule { }
