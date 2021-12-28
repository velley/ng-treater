// 第一页的加载状态和第二页以后的加载状态需要区分
export type DataLoadingState = 
  'initPending' |  //初次加载中
  'pagePending' |  //后续页码加载中
  'none'        |  //数据为空
  'initSuccess' |  //初次加载成功
  'pageSuccess' | 
  'end'         | 
  'initEnd'     |
  'initError'   |
  'pageError'

export interface Setting {
  method?: 'post' | 'get',
  startPage?: 0 | 1;
  pageSize?: number;
  isWaterFall?: boolean;
  plucker?: string[];
  totalNums?: string;
  totalName?: string[];
  pageNames?: [string, string], 
  pendingImgPath?: string;
  pendingText?: string;
  emptyImgPath?: string;
  emptyText?: string;
  failedImgPath?: string;  
  failedText?: string;
  retry?: boolean;
  useSkip?: boolean;
  [prop: string]: any
}
