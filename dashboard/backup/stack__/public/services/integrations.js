'use strict';

angular.module('mean.stack').factory('Integrations', ['$q',
    function($q) {
        return {
            services: {
                backups: {
                    index: 1,
                    title: 'backups',
                    name: 'backups',
                    subServices: [{
                        name: 'backups',
                        title: 'custom backups',
                        icon: 'icon-backups',
                        description: 'Add your custom backups',
                        platforms: ['all'],
                        settings: true
                    }, {
                        name: 'updraftplus',
                        title: 'UpdraftPlus',
                        icon: 'icon-updraft',
                        description: 'Backup, restore and migration plugin',
                        platforms: ['wordpress', 'web']
                    }, {
                        name: 'backup_migrate',
                        title: 'Backup and Migrate',
                        icon: 'icon-backup-migrate',
                        description: 'Restore your Drupal MySQL database, code, and files or migrate a site between environments',
                        platforms: ['drupal', 'web']
                    }]
                },
                performance: {
                    index: 2,
                    title: 'performance',
                    name: 'performance',
                    subServices: [{
                        name: 'googleapis_performance',
                        title: 'Google Page Speed Insights',
                        icon: 'icon-performance',
                        description: 'With Page Speed Insights you can identify ways to make your site faster and more mobile-friendly',
                        platforms: ['all']
                    }]
                },
                accessibility: {
                    index: 3,
                    title: 'accessibility',
                    name: 'accessibility',
                    subServices: [{
                        name: 'accessibility_pa11y',
                        title: 'Pa11y accessibility scan',
                        icon: 'icon-accessibility',
                        description: 'Monitor the accessibility of your websites and protect against accessibility errors creeping into your codebase',
                        platforms: ['all']
                    }]
                },
                seo: {
                    index: 4,
                    title: 'seo',
                    name: 'seo',
                    subServices: [{
                        name: 'wordpress-seo',
                        title: 'WP Yoast SEO',
                        icon: 'icon-yoast',
                        description: 'SEO plugin, handles the technical optimization of your site & assists with optimizing your content',
                        platforms: ['web', 'wordpress']
                    }, {
                        name: 'drupal_yoast_seo',
                        title: 'DRUPAL Yoast SEO',
                        icon: 'icon-yoast',
                        description: 'SEO plugin, handles the technical optimization of your site & assists with optimizing your content',
                        platforms: ['web', 'drupal']
                    }]
                },
                security: {
                    index: 5,
                    title: 'security',
                    name: 'security',
                    subServices: [{
                        name: 'wordpress-all-in-one-wp-security-and-firewall',
                        title: 'all in one security',
                        icon: 'icon-wp-security',
                        description: 'The ultimate security plugin that will take your website\'s security to a whole new level',
                        platforms: ['web', 'wordpress']
                    }, {
                        name: 'drupal_security_review',
                        title: 'security review',
                        icon: 'icon-security',
                        description: 'The ultimate security plugin that will take your website\'s security to a whole new level',
                        platforms: ['web', 'drupal']
                    }]
                },
                ci: {
                    index: 6,
                    title: 'Continuous Integration',
                    name: 'ci',
                    subServices: [{
                        name: 'platform',
                        icon: 'icon-platform',
                        title: 'platform',
                        description: 'Continuous Deployment Platform as a Service powered by a high-availability grid of micro-containers',
                        platforms: ['all'],
                        settings: true
                    }, {
                        name: 'github',
                        icon: 'icon-github',
                        title: 'Github',
                        description: 'How people build software. Share, and work together',
                        platforms: ['all'],
                        settings: true
                    }, {
                        name: 'bitbucket',
                        icon: 'icon-bitbucket',
                        title: 'Bitbucket',
                        description: 'Git solution for professional teams. Collaborate on code with inline comments and pull requests',
                        platforms: ['all'],
                        settings: true
                    }]
                }
            }
        }
    }
]);
