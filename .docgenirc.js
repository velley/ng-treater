/**
 * @type {import('@docgeni/core').DocgeniConfig}
 */
module.exports = {
    mode: 'lite',
    title: 'ng-treater',
    description: '',
    docsDir: 'docs',
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
