/*
 * Public API Surface of ng-treater
 */

//  导出服务
export * from './lib/paging-data/paging-data.service';

// 导出模块
export { PagingDataModule } from './lib/paging-data/paging-data.module';
export { ShareModule as NtShare } from './lib/share/share.module';

// 导出令牌与类型接口
export * from './lib/injection';
export * from './lib/interface';

// 导出指令
export * from './lib/share/directives/data-placeholder.directive';
export * from './lib/paging-data/directives/scroll-loading.directive';
export { PagingContainerDirective } from './lib/paging-data/directives/pagingContainer.directive';
