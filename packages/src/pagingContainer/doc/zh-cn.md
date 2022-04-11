---
title: 分页数据
subtitle: pagingContainer
order: 2
---

## ✍ 基本使用

<example name="nt-pagingContainer-basic-example" />

> 如上所示，只需要在组件内的div元素上加上ntPagingContainer指令并传入url请求地址，指令内部就会自动发送请求。<br>
> 通过模板变量paging访问指令的实例，即可获取到data$数据，data$是一个Observable对象，每次请求成功，data$便会向订阅者发布最新数据。

## ✍ 结合table组件实现分页请求
上面例子仅展示了如何通过指令自动发送请求并获取数据，本例子将会通过ng-zorro的table组件来演示如何实现分页请求。

<example name="nt-pagingContainer-page-example" />

> 注明：ng-treater插件仅依赖angular与rxjs，不依赖任何第三方UI组件库。本示例旨在说明ng-treater可以与组件库的表格、列表等组件结合使用。

## ✍ 对分页数据进行条件查询
大部分场景下，你都需要支持用户输入关键词等查询条件来获取数据。在ng-treater中，只需要调用相关方法即可。

<example name="nt-pagingContainer-filter-example" />

> 1.addFilter方法会将每次传入的查询数据保存，并与新的查询数据进行合并后发起请求。若想清除查询条件，可以调用reset方法。 <br>
> 2.可以发现，在表格进入第2页之后点击查询按钮，数据返回后分页器会自动重置为第1页。这是因为pagingContainer内部会自行管理分页状态，表格组件只需要访问其page属性即可实时获取分页信息。<br>
> 3.可以通过指令的querys属性传入默认的查询条件，指令在第一次发起请求时便会带上该条件作为参数；且该条件不会被reset方法清除。示例如下：
```html
<div class="container" ntPagingContainer #paging="ntPaging" url="/api/getPagingData" [querys]="{code: 1}">
  <!-- ... -->
</div>
```
> 4.通常情况下，后端提供的分页数据接口具有统一的分页配置，如果存在个别接口与统一配置不兼容，可以通过pagingContainer指令传入本地分页配置。示例如下(配置参数请参考NtPagingSetting)：
```html
<div 
  class="container" 
  ntPagingContainer 
  #paging="ntPaging" 
  url="/api/getPagingData" 
  [options]="{method：'get', dataPlucker:['data', 'list']}"
>
  <!-- 这里的method与dataPlucker配置将会覆盖appModule中的全局配置 -->
</div>
```

## ✍ 使用PagingDataService服务
指令pagingContainer内部的主要逻辑都基于PagingDataService服务，在少数场景，你需要直接使用服务来完成分页请求。
> 因为指令pagingContainer会在视图初始化后自动执行请求，如果你需要精确控制请求时机，或者需要对请求返回的数据进行处理后才进行渲染，那么这时候就需要用到PagingDataService。

<example name="nt-pagingContainer-service-example" />

> 如上所示，PagingDataService可以完全替代指令pagingContainer；只需要调用create方法便能获取数据(create方法可传入3个参数，第二个参数为默认查询条件，第三个参数为分页配置)。<br>
> 注意：在使用PagingDataService的组件中，你需要通过元数据providers提供该服务。

## ✍ 滚动加载
若想支持滚动加载场景，请在分页配置中将scrollLoading设为true;

```html
<div ntPagingContainer #paging="ntPaging" url="/api/getPagingData" [querys]="{scrollLoading: true}">
  <!-- 同理，如果你的项目中分页数据展示全部为滚动加载，也可以在appModule中更改全局配置 -->
</div>
```

<example name="nt-pagingContainer-scroll-example" />

> 如上所示，只需要在容器元素上使用scrollLoading指令便可实现滚动加载的功能（需要你自行为该元素设置overflow样式）。