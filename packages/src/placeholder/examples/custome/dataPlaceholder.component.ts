import { Component, OnInit } from '@angular/core';
import { DataPlaceholderAccessor, NtLoadingState } from 'ng-treater';

@Component({
  selector: 'app-data-placeholder',
  template: `
    <div class="placeholder" >
      <nz-spin *ngIf="state === 'pending'"></nz-spin>
      <nz-empty *ngIf="state === 'empty'"></nz-empty>
      <nz-empty *ngIf="state === 'failed'" [nzNotFoundContent]="tpl" >
        <ng-template #tpl>
          <span class="error-tip">
            请求失败，<a (click)="retry()">点此重试</a>
          </span>
        </ng-template>
      </nz-empty>
    </div>
  `
})
export class DataPlaceholderComponent implements DataPlaceholderAccessor{

  state!: NtLoadingState;
  retry!: () =>  void;

  writeState(state: NtLoadingState): void {
    this.state = state;
  }

  registerRetryFunc(fn: any): void {
    this.retry = fn;
  }

}