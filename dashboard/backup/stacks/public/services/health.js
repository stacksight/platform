'use strict';

angular.module('mean.stacks').factory('Health', ['Sapi', '$q',
    function(Sapi, $q) {
        var latestScoreData = {};

        function latestScore(groupId) {
            var defer = $q.defer();
            if (latestScoreData[groupId]) defer.resolve(latestScoreData[groupId]);
            else {
                Sapi.get({
                    cmd_api: '/sapi/healthStats/latestScore/' + groupId
                }).then(function(data) {
                    latestScoreData[groupId] = data;
                    defer.resolve(data);
                }, function(error) {
                    defer.reject(error);
                });
            }

            return defer.promise;
        }

        return {
            //data instead of widgets
            tabs: function(options) {
                return [{
                    category: 'performance',
                    name: 'performance',
                    desc: "performance",
                    title: "PERFORMANCE",
                    widgets: [],
                    tabTitle: 'PERFORMANCE',
                    noData: 'to view performance data go to <a href="#!/stacks/' + options.id + '/settings">settings</a>',
                    server: true,
                    display: true,
                    onClient: false,
                    noexist: {
                        wordpress: {
                            'title': 'Performance Sight',
                            'description': 'Please enter your site\'s web adress below in order to monitor the Performance of your site.'
                        },
                        drupal: {
                            'title': 'Performance Sight',
                            'description': 'Please enter your site\'s web adress below in order to monitor the Performance of your site.'
                        }
                    }
                }, {
                    category: 'accessibility',
                    name: 'accessibility',
                    desc: "accessibility",
                    title: "ACCESSIBILITY",
                    widgets: [],
                    tabTitle: 'ACCESSIBILITY',
                    noData: 'to view accessibility data go to <a href="#!/stacks/' + options.id + '/settings">settings</a>',
                    server: true,
                    display: true,
                    onClient: false,
                    noexist: {
                        wordpress: {
                            'title': 'Accessibility Sight',
                            'description': 'Please enter your site\'s web adress below in order to monitor the Accessibility of your site.'
                        },
                        drupal: {
                            'title': 'Accessibility Sight',
                            'description': 'Please enter your site\'s web adress below in order to monitor the Accessibility of your site.'
                        }
                    }
                }, /*{
                    category: 'availability',
                    name: 'availability',
                    title: "AVAILABILITY",
                    tabTitle: 'AVAILABILITY',
                    desc: '',
                    server: false,
                    display: true,
                    onClient: false,
                    noData: 'to view availability data go to <a href="#!/stacks/' + options.id + '/settings">settings</a> and set your domain.',
                    noexist: {
                        wordpress: {
                            'title': 'Availability Sight',
                            'description': 'Please enter your site\'s web adress below in order to monitor the Availability of your site.'
                        },
                        drupal: {
                            'title': 'Availability Sight',
                            'description': 'Please enter your site\'s web adress below in order to monitor the Availability of your site.'
                        }
                    },
                    data: []
                },*/ {
                    category: 'health',
                    name: 'health',
                    title: "HEALTH",
                    tabTitle: 'HEALTH',
                    desc: "health",
                    widgets: [],
                    server: true,
                    display: false
                }, {
                    category: 'backups',
                    name: 'backups',
                    title: "backups",
                    tabTitle: 'backups',
                    desc: "backups",
                    type: 'integrations-backups',
                    widgets: [],
                    server: true,
                    display: true,
                    onClient: true,
                    displayIfData: true,
                    noData: 'go to <a href="#!/stacks/' + options.id + '/integrations">integrations</a> to add your custom backups.',
                    noexist: {
                        wordpress: {
                            'img': '/stacks/assets/img/logo_backup_wp.png',
                            'downloadURL': 'https://wordpress.org/plugins/updraftplus/',
                            'title': 'Backup Sight',
                            'description': 'Please install UpdraftPlus in order to view Backups Health reports.',
                            'module_title_': 'UpdraftPlus',
                            'module_description': 'UpdraftPlus simplifies backups (and restoration). Backup into the cloud (Amazon S3 (or compatible), Dropbox, Google Drive, Rackspace Cloud, DreamObjects, FTP, Openstack Swift, UpdraftPlus Vault and email) and restore with a single click. Backups of files and database can have separate schedules.'
                        },
                        drupal: {
                            'img': '/stacks/assets/img/logo_backup_dp.png',
                            'downloadURL': 'https://www.drupal.org/project/backup_migrate',
                            'title': 'Backup Sight',
                            'description': 'Please install Backup and Migrate in order to view Backups Health reports.',
                            'module_title_': 'Backup and Migrate',
                            'module_description': 'Back up and restore your MySQL database, code, and files or migrate a site between environments.'
                        }
                    }
                }, {
                    category: 'seo',
                    name: 'seo',
                    desc: "seo",
                    title: "SEO",
                    widgets: [],
                    tabTitle: 'SEO',
                    server: false,
                    display: true,
                    onClient: true,
                    noexist: {
                        wordpress: {
                            'img': '/stacks/assets/img/logo_seo_wp.png',
                            'downloadURL': 'https://wordpress.org/plugins/wordpress-seo/',
                            'title': 'SEO Sight',
                            'description': 'Please install SEO Yoast in order to view SEO Health reports.',
                            'module_title_': 'Yoast SEO',
                            'module_description': 'Yoast SEO plugin goes the extra mile to take care of all the technical optimization, more on that below, it first and foremost helps you write better content. Yoast SEO forces you to choose a focus keyword when you\'re writing your articles, and then makes sure you use that focus keyword everywhere.'
                        },
                        drupal: {
                            'img': '/stacks/assets/img/logo_seo_dp.png',
                            'downloadURL': 'http://drupal.org/project/yoast_seo',
                            'title': 'SEO Sight',
                            'description': 'Please install SEO Yoast in order to view SEO Health reports.',
                            'module_title_': 'Yoast SEO',
                            'module_description': 'Yoast SEO helps you optimize content around keywords in a natural, non-spam way.'
                        }
                    }
                }, {
                    category: 'security',
                    name: 'security',
                    title: "SECURITY",
                    tabTitle: 'SECURITY',
                    desc: "security",
                    widgets: [],
                    server: false,
                    display: true,
                    onClient: true,
                    noData: 'add security module ...',
                    noexist: {
                        wordpress: {
                            'img': '/stacks/assets/img/logo_security_wp.png',
                            'downloadURL': 'https://wordpress.org/plugins/all-in-one-wp-security-and-firewall/',
                            'title': 'Security Sight',
                            'description': 'Please install AIO WP Security & Firewall Plugin in order to view Security Health reports.',
                            'module_title_': 'AIO WP Security & Firewall Plugin',
                            'module_description': 'A COMPREHENSIVE, EASY TO USE, STABLE SECURITY PLUGIN. While wordPress itself is a very secure platform. However, it helps to add some extra security and firewall to your site by using a security plugin that enforces a lot of good security practices in a whole new level.'
                        },
                        drupal: {
                            'img': false,
                            'downloadURL': 'https://www.drupal.org/project/security_review',
                            'title': 'Security Sight',
                            'description': 'Please install Security Review in order to view Security Health reports.',
                            'module_title_': ' Security Review',
                            'module_description': 'Security Review module automates testing for many of the easy-to-make mistakes that render your site insecure.'
                        }
                    }
                }]
            },
            latestScore: latestScore,
            stacksUnderThreshold: function(groupId, types, cb) {
                var stacks = [];
                latestScore(groupId).then(function(data) {
                    data = data.score;
                    for (var t in types) {
                        if (!data[t]) break;
                        if (data[t].avgScore === 'NaN') data[t].avgScore = '';
                        for (var s in data[t].stacks)
                            if (data[t].stacks[s] < types[t] && stacks.indexOf(s) === -1)
                                stacks.push({ id: s, score: data[t].stacks[s] });
                    }
                    cb(null, { stacks: stacks, score: data });
                }, function(error) {
                    cb(error);
                });
            },
            avgScore: function(groupId) {
                var defer = $q.defer();
                Sapi.get({
                    cmd_api: '/sapi/healthStats/avgScore/' + groupId
                }).then(function(data) {
                    defer.resolve(data);
                }, function(error) {
                    defer.reject(error);
                });
                return defer.promise;
            }
        };
    }
]);
