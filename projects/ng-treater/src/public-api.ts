/*
 * Public API Surface of ng-treater
 */

//  导出服务
export * from './lib/paging-data/paging-data.service'


// 导出模块
export { PagingDataModule } from './lib/paging-data/paging-data.module'

// 导出令牌
export * from './lib/injection';

// 导出指令
export * from './lib/paging-data/placeholder/data-placeholder.directive';
export * from './lib/paging-data/placeholder/data-placeholder.component';
export * from './lib/paging-data/scroll-loading/scroll-loading.directives';
export * from './lib/paging-data/scroll-loading/scroll-loading.component';
