/**
 * @type {import('@docgeni/core').DocgeniConfig}
 */
module.exports = {
    mode: 'lite',
    title: 'ng-treater',
    theme: 'angular',
    logoUrl: 'https://angular.cn/assets/images/logos/angular/shield-large.svg',
    repoUrl: 'https://github.com/velley/ng-treater.git',
    description: '为angular项目提供的数据查询插件',
    docsDir: 'docsmd',
    outputDir: 'docs',
    navs: [
        null,
        {
            title: '使用指南',
            path: 'guides',
            lib: 'ng-treater',
            locales: {}
        }
    ],
    libs: [
        {
            name: 'ng-treater',
            abbrName: 'nt',
            rootDir: 'packages',
            include: [
                'src',
            ],
            categories: []
        }
    ],
    defaultLocale: 'zh-cn'
};
