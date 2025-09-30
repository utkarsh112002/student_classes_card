module.exports = {
    name: 'StudentClasses',
    publisher: 'Sample',
    cards: [{
        type: 'StudentClassesCard',
        source: './src/cards/StudentClassesCard',
        title: 'StudentClasses Card',
        displayCardType: 'StudentClasses Card',
        description: 'This is an introductory card to the Ellucian Experience SDK',
        pageRoute: {
            route: '/',
            excludeClickSelectors: ['a']
        }
    }],
    page: {
        source: './src/page/router.jsx'
    }
};