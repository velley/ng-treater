---
title: 简单数据
subtitle: simpleContainer
order: 3
---

## 使用场景
该指令可以理解为简化版的pagingContainer，用于非分页数据的请求，除了没有分页相关api外，整体使用方式与pagingContainer基本相同，直接参考pagingContainer中的示例即可。

> simpleContainer也有一个对应的服务simpleDataService，可以使用该服务进行替代使用。
> 由于适用于非分页数据请求场景，所以scrollLoading指令在此时无效；但dataPlaceholder指令仍然适用。

<br>

```html
<div ntSimpleContainer #simple="ntSimple" url="/api/getData">
  <!-- 你的渲染节点 -->
</div>
```