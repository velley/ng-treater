---
title: 总览
order: 1
---

## 介绍
ng-treater是基于angular与rxjs的数据查询插件，针对前后端数据请求场景，使用本插件可将该场景中的通用逻辑部分进行高度封装，并统一管理，例如请求数据的网络状态，分页请求的页码信息等。
> 1. 本插件非组件库，仅提供若干指令与服务来实现相关功能。
> 2. 本插件的请求依赖于angular官方的http模块，所以项目中为http配置的拦截器等功能也对插件内部的请求生效。
## 下载ng-treater

```
npm i ng-treater -S
```

## 引入模块NgTreaterModule
```ts
import { NgTreaterModule } from 'ng-treater';

@NgModule({
  declarations: [
    //...
  ],
  imports: [
   NgTreaterModule
  ]
})
export class MyFeatureModule { }
```
> 引入后即可在当前模块的组件中使用所有相关指令

## 注入全局配置 
ng-treater需要你在应用根模块提供全局配置，例如分页请求字段名、默认请求方法、请求重试次数等等。

```ts
import { NG_TREATER_SETTINGS,  NgTreaterSetting } from 'ng-treater';

@NgModule({
  declarations: [
    //...
  ],
  imports: [
    //...
  ],
  providers: [
    {provide: NG_TREATER_SETTINGS, useValue: <NgTreaterSetting>{
      // 分页数据请求配置
      paging: {
        // 起始页
        start: 1,
        // 每页条目数量
        size: 10,
        // 当前页字段名
        indexKey: 'pageNo',
        // 每页条目数量字段名
        sizeKey: 'pageSize',
        // 分页数据取值路径(在http返回的数据结构中取值)
        dataPlucker: ['data'],
        // 总条数取值路径(在http返回的数据结构中取值)
        totalPlucker: ['total'],
        // 是否为滚动加载
        scrollLoading: false,
        // 默认请求方法
        method: 'post'
      },
      //简单数据请求配置
      simple: {
        plucker: ['data'],
        method: 'get'
      }
    }}
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
```