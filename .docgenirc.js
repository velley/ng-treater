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
            title: 'Components',
            path: 'components',
            lib: 'ng-treater',
            locales: {}
        }
    ],
    libs: [
        {
            name: 'ng-treater',
            rootDir: 'projects/ng-treater',
            include: [
                'src',
                'src/lib'
            ],
            categories: []
        }
    ]
};
