
module.exports = [
  {
    type: 'directive',
    name: 'ntPagingContainer',
    properties: [
      {
        name: 'url',
        type: 'string',
        default: "undefined",
        description: '分页请求的url地址，可以理解为httpClient的url参数'
      },
      {
        name: 'querys',
        type: 'object',
        default: "{}",
        description: '初始化请求参数'
      },
      {
        name: 'manual',
        type: 'boolean',
        default: "false",
        description: '是否手动控制请求时机，默认为false,初始化时会自动创建paging实例并发送请求'
      },
      {
        name: 'options',
        type: 'PagingSetting',
        default: "{}",
        description: '本地分页配置参数'
      },
    ]
  }
]