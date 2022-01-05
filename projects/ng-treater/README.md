
## Directive
### ntPagingContainer
----
- 参数

|参数名|类型|默认值|备注|
|------|----|-----|----|
|url  |string|undefind|分页请求的url地址|
|querys|json|{  }|分页请求的默认参数|
|options|PagingSetting|undefind|分页请求配置项，可以覆盖全局配置

- 事件

|事件名|输出类型|备注|
|---------|----|-----|
|created  |Observable<any>|数据源创建成功，并输出observable供外部订阅|

### ntScrollLoading
> 该指令暂不需要传入参数，只需与ntPagingContainer放置在同一宿主元素即可

### ntPlaceHolder
> 该指令暂不需要传入参数，需要配合ng-container或元素html元素将数据渲染dom节点包裹。

----


## Service
- PagingDataService
> 该服务为内部指令使用的通用服务,用于定义分页请求的逻辑集合。若需要对分页请求逻辑进行更精确的控制，可以手动注入该服务以替代指令ntPagingContainer(可以理解为ntPgingContainer内部接管了对PagingDataService的调用);示例如下：
```ts
// demo.component.ts
import { PagingDataService } from 'ng-treater';

@Component({
  selector: 'app-demo',
  templateUrl: './demo.component.html',
  providers: [PagingDataService] //必须在组件内部提供该服务
})
export class BanksComponent implements OnInit {

  data$: Observable<any[]>;
  
  constructor(
    private paging: PagingDataService<any>,
  ) { }

  ngOnInit(): void {
    this.data$ = this.paging.create('/api/getData');
  }

  get State() {
    return this.paging.loadingState$;
  }
  
  nexPage() {
    this.paging.nextPage()
  }

  prePage() {
    this.paging.previousPage()
  }
}
```
> 手动引入PagingService后，不能再使用ntPagingContainer；但ntScrollLoading与ntPlaceHolder仍可使用
```html
<!-- demo.component.html -->
<div class="container" >
  <ng-container *ngPlaceHolder>
    <div class="item" *ngFor="let item of data$ |async">
      {{item}}
    </div>
  </ng-container>  
</div>
```
----

## Interface

- PagingSetting
> 分页请求配置项
``` ts
{  
  /** 每页条数 */
  size: number;
  /** 起始页索引 */
  start: 0 | 1;
  /** 每页条数的键名 */
  sizeKey: string;
  /** 当前页索引的键名 */
  indexKey: string;  
  /** 访问列表数据的属性路径 */
  dataPlucker: string[];
  /** 访问总条数的属性路径 */
  totalPlucker: string[];
  /** 是否为滚动加载 */
  scrollLoading: boolean;
}

```

- NgTreaterSetting 
> ng-treater插件的全局配置项，配合令牌NG_TREATER_SETTINGS一起使用
```ts
{  
  /** 自定义占位提示组件 */
  placeholder?: Type<DataLoadingStateTreater>;
  /** 请求重试次数 */
  retryCounter?: number;
  /** 默认请求方法 */
  method?: 'post' | 'get';
  /** 分页请求配置项 */
  paging?: PagingSetting;
}
```

- DataLoadingStateTreater 
> 自定义Placeholder组件需要继承的接口
```ts
{
  /** 注册加载状态数据 */
  registerLoadingState: (state: BehaviorSubject<NtLoadingState>) => void;
  /** 注册错误重试方法 */
  registerRetryFunc: (fn: any) => void;
}
```

- enum NtLoadingState 
> 数据请求状态枚举
```ts
{
  /** 数据请求中*/
  PENDING = 'pending',
  /** 数据请求成功 */
  SUCCESS = 'success',
  /** 空数据 */
  EMPTY = 'empty',
  /** 请求失败 */
  FAILED  = 'failed',
  /** 请求结束(仅在分页请求场景下有效，表示当前已为最后一页，无法再请求下一页数据) */
  END = 'end'
}
```