## <div align="center">👉NG-TREATER👈</div>
### <div align="center">供angular开发者使用的分页查询插件</div>

<br>

<div align="center">

![GitHub package.json version (subfolder of monorepo)](https://img.shields.io/github/package-json/v/velley/ng-treater?filename=projects%2Fng-treater%2Fpackage.json)
![](https://img.shields.io/badge/angular-v12.x-green.svg)
![GitHub](https://img.shields.io/github/license/velley/ng-treater)


</div>

----

### ✍ 主要特性
- 本插件将业务中最常见的分页数据查询功能进行抽象并封装为指令。使用相关指令后可通过Observable订阅服务端返回的分页数据，并能直接调用与分页查询相关的方法(如上/下一页，条件筛选，刷新等)。

<br>

### ✍ 快速开始
- 下载插件
```
npm i ng-treater
```
- 导入PagingDataModule模块,使用NG_TREATERR_SETTINGS令牌注入全局配置
```ts
// app.module
import { NG_TREATER_SETTINGS, PagingDataModule, NgTreaterSetting } from 'ng-treater';

@NgModule({
  declarations: [AppComponent],
  imports: [PagingDataModule, HttpClientModule, ...],
  providers: [
    {provide: NG_TREATER_SETTINGS, useValue: <NgTreaterSetting>{
      defaultMethod: 'get',
      retryCounter: 2,
      paging: {
        start: 1,
        size: 10,
        indexKey: 'pageNo',
        sizeKey: 'pageSize',
        dataPlucker: ['data'],
        totalPlucker: ['total'],
        scrollLoading: false
      }
    }}
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
```

<br>

- 使用指令<font color="yellowgreen" size="4">ntPagingContaiiner</font>快速请求数据
> 在容器元素上使用该指令并传入url请求地址，指令内部会立即发送请求。通过模板变量可获取指令实例，访问实例data$(为Observable对象)属性即可实时订阅服务端数据。
```html
<!-- demo.component.html -->
<div class="container" ntPagingContainer #paging="ntPaging" url="/miniapp/queryOrganization">  
  <div class="item" *ngFor="let item of paging.data$ | async">
    {{item.name}}
  </div>      
</div>
<button (click)="paging.previousPage()">上一页</button>
<button (click)="paging.nextPage()">下一页</button>
<div class="total">总条数:{{paging.total}}</div>
```


<br>

- 使用指令<font color="yellowgreen" size="4">ntScrollLoading</font>快速实现滚动加载功能
> 只需在容器元素上加上该指令便可生效(需要自行为元素设置滚动样式)。当容器元素滚动到底部时，指令内部会自动发起下一页请求，同时容器底部会出现对应的文本提示；请求成功后，组件模板会实时更新渲染数据。
```html
<!-- demo.component.html -->
<div class="container" ntPagingContainer ntScrollLoading #paging="ntPaging" url="/miniapp/queryOrganization">  
  <div class="item" *ngFor="let item of paging.data$ | async">
    {{item.name}}
  </div>      
</div>
```

<br>

- 使用指令<font color="yellowgreen" size="4">ntDataPlaceHolder</font>实现请求占位提示功能
> 该指令内部会监听初次请求的状态。并根据状态(请求中/请求失败/空数据)在容器元素内添加对应占位提示,这样可以防止在数据成功渲染前界面上出现空白。
```html
<!-- demo.component.html -->
<div class="container" ntPagingContainer ntScrollLoading #paging="ntPaging" url="/miniapp/queryOrganization">  
  <ng-container *ntDataPlaceHolder>
    <div class="item" *ngFor="let item of paging.data$ | async">
      {{item.name}}
    </div>
  </ng-container>     
</div>
```

> 你可以为占位提示编写一个自定义组件并传入全局配置中(因为本插件的默认占位提示仅仅是一段文字，你可能更希望占位提示是一个图标或者其他效果)。编写占位提示组件的示例如下
```ts
// my-dataPlaceholder.component.ts
import { NtLoadingState, DataLoadingStateTreater } from 'ng-treaterr';

const LOADING_STATE_MAP = {
  'pending': '正在加载...',
  'failed': '加载失败',
  'empty': '暂无数据'
}
@Component({
  template: `    
    <div class="nt-placeholder">{{ loadingTextObj[state] }}</div>   
    <div class="retry" *ngIf="state==='failed'" (click)="retry()">点击重试</div> 
  `,
  styles:[`
    .nt-placeholder {
      padding-top: 50px;
      text-align: center;
      color: #999;
    }
  `]
})
class PlaceholderComponent implements DataLoadingStateTreater {
  
  state: NtLoadingState;
  loadingStateMap = LOADING_STATE_MAP;
  retry: () => void;

  registerLoadingState(state: BehaviorSubject<NtLoadingState>){
    state.subscribe(val => this.state = val)
  };

  registerRetryFunc(fn: any) {
    this.retry = fn;
  };
}
```

### ✍ 接口文档
点击此处查看相关文档 [ng-treater接口文档](./projects/ng-treater/README.md).
