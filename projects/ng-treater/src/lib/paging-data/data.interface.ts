// 第一页的加载状态和第二页以后的加载状态需要区分
export type DataLoadingState = 
  'initPending' | 
  'pagePending' | 
  'none'        | 
  'initSuccess' | 
  'pageSuccess' | 
  'end'         | 
  'initEnd'     |
  'initError'   |
  'pageError'

export interface Setting {
  method?: 'post' | 'get',
  startPage?: number;
  pageSize?: number;
  isWaterFall?: boolean;
  plucker?: string[];
  totalNums?: string;
  pageNames?: [string, string],
  pendingImgPath?: string;
  pendingText?: string;
  emptyImgPath?: string;
  emptyText?: string;
  failedImgPath?: string;  
  failedText?: string;
  retry?: boolean;
  [prop: string]: any
}
