
module.exports = [
  {
    type: 'component',
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
        name: 'options',
        type: 'PagingSetting',
        default: "{}",
        description: '本地分页配置参数'
      },
    ]
  }
]