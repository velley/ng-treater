# NgTreater

This library was generated with [Angular CLI](https://github.com/angular/angular-cli) version 10.0.9.
  
# 主要特性：
  
## 一、对分页数据处理逻辑的抽象
### 1.功能
+ 通过pagingDataSevice服务快速请求并处理服务端返回的分页数据；
+ 通过ScrollLoading指令来实现滚动底部时自动加载分页数据；
+ 通过DataPlaceholder指令来实现请求数据时渲染不同的占位提示(可为请求中/空数据/请求失败3中状态配置不同的占位图)。
+ 通过PullFresh指令实现下拉刷新。（代码待实现）
### 2.使用方法
+ 在需要分页数据的组件中import导入pagiService, 并在provides数据中添加该Service
+ 在组件的constructor构造器中注入服务，然后根据实际需要调用服务的create方法，传入请求地址和初始参数，并订阅返回的Observable对象(一个组件中只能调用一次create方法)
+ 可以在组件模板中使用ntScrollLoading/ntDataPlaceHolder指令分别实现滚动加载和占位图提示的功能
+ 可以在该组件所属的特性模块或者根模块提供一个分页配置服务，该服务令牌为 PAGING_DATA_SETTING,下面为使用示例：  
``` ts
  // import { PAGING_DATA_SETTING } from 'ng-treater';  
  { provide: PAGING_DATA_SETTING,  
    useValue:{  
      isWaterFall: true, //是否已瀑布流的特性发布数据(默认为true)  
      pageSize: 16, //每一页的数据条数  
      plucker:['data','result'], //存放分页数据的响应体键名，不传默认为res.data(此处传值后则为res.data.result)  
      retry: true, //请求失败时是否允许显示重试按钮  
      pendingImgPath: 'assets/data_loading.png', //请求中的占位图路径  
      pendingText: 'assets/data_loading.png', //请求中的文字提示  
      emptyImgPath: 'assets/no_data.png', //空数据时的占位图路径  
      emptyText: 'assets/no_data.png', //空数据时的文字提示  
      failedImgPath: 'assets/data_loading_error.png' //请求失败的占位图路径  
      failedText: 'assets/data_loading_error.png' //请求失败的文字提示  
    }  
  },  
```  
# 资料参考
[点击此处查看pagingDataService及相关指令的实现思路](https://zhuanlan.zhihu.com/p/165118088)

