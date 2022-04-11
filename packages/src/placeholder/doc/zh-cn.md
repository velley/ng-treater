---
title: 请求占位符
subtitle: dataPlaceholder
order: 4
---

## ✍ 基本使用
dataPlaceholder指令用于请求数据暂未成功返回时的占位提示(请求中，请求失败，空数据)，需要与pagingContainer/simpleContainer结合使用(也可以将这两个指令替换为它们对应的服务，总之dataPlaceholder指令不能单独使用)

<example name="nt-placeholder-basic-example" />

> 可以看到，设置datPlaceholder之后，界面会自动根据网络请求状态显示对应的占位提示。 <br>
> dataPlaceholder为结构性指令，不能与pagingContainer指令附加上同一个元素上，会导致无法拿到指令实例。

## ✍ 自定义占位提示
上面例子中，占位提示仅仅只是一段提示文本，如果需要展示特定的占位提示，可以编写自定义占位组件并传入ntTreaterSetting配置中。

<br>

> 自定义占位组件代码示例如下，使用了ng-zorro的empty与spin组件来渲染占位提示
```ts
import { Component, OnInit } from '@angular/core';
import { DataPlaceholderAccessor, NtLoadingState } from 'ng-treater';

@Component({
  selector: 'app-data-placeholder',
  template: `
    <div class="placeholder" fxFill>
      <nz-spin *ngIf="state === 'pending'"></nz-spin>
      <nz-empty *ngIf="state === 'empty'"></nz-empty>
      <nz-empty *ngIf="state === 'failed'"
        nzNotFoundImage="assets/404.png"
        [nzNotFoundContent]="tpl"
      >
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
```

<br>

> 将组件传入NtTreaterSetting配置
```ts
import { NG_TREATER_SETTINGS,  NgTreaterSetting } from 'ng-treater';
import { DataPlaceholderComponent } from './components/data-placeholder/data-placeholder.component';
@NgModule({
  declarations: [
    //...
  ],
  imports: [
    //...
  ],
  providers: [
    {provide: NG_TREATER_SETTINGS, useValue: <NgTreaterSetting>{
      placeholder: DataPlaceholderComponent,
      paging: {
        //...
      },
      simple: {
        //...
      }
    }}
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
```

<br>

> 实际效果

<example name="nt-placeholder-custome-example" />