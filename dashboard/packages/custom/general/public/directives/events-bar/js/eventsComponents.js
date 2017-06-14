'use strict';

angular.module('mean.general').factory('EventsComponents', [
    function() {
        return {
            design: function() {
                return {
                    post: {
                        icon: 'fa-file-text',
                        icon_col: '#8FD5FF',
                        template: false
                    },
                    comment: {
                        icon: 'fa-comment',
                        icon_col: '#96B5BE',
                        template: false
                    },
                    file: {
                        icon: 'fa-file-o',
                        icon_col: '#394bfb',
                        template: true
                    },
                    image: {
                        icon: 'fa-picture-o',
                        icon_col: '#de8628',
                        template: false
                    },
                    session: {
                        icon: 'fa-refresh',
                        icon_col: '#F1A40F',
                        template: false
                    },
                    user: {
                        icon: 'fa-user',
                        icon_col: '#8C66B1',
                        template: true
                    },
                    taxonomy: {
                        icon: 'fa-pie-chart',
                        icon_col: '#de1b16',
                        template: false
                    },
                    settings: {
                        icon: 'fa-cog',
                        icon_col: '#fbe939',
                        template: false
                    },
                    cron: {
                        icon: 'fa-cogs',
                        icon_col: '#b9fb39',
                        template: false
                    },
                    content: {
                        icon: 'fa-file-text',
                        icon_col: '#8FD5FF',
                        template: false
                    },
                    system: {
                        icon: 'fa-cubes',
                        icon_col: '#c79696',
                        template: false
                    },
                    actions: {
                        icon: 'fa-certificate',
                        icon_col: '#fd8e00',
                        template: false
                    },
                    page: {
                        icon: 'fa-file-o',
                        icon_col: '#fd8e00',
                        template: false
                    },
                    stacksight: {
                        icon: 'platform web sm',
                        icon_col: '#FFD500',
                        template: false
                    }
                };
            }
        };
    }
]);
