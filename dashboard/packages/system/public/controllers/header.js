'use strict';

angular.module('mean.system').controller('HeaderController', ['$scope', '$rootScope', 'Global', 'Menus', '$state', 'MeanSocket', 'MeanUser', 'GetCompany',
    function($scope, $rootScope, Global, Menus, $state, MeanSocket, MeanUser, GetCompany) {
        $scope.global = Global;
        $scope.menus = {};
        $scope.$state = $state;

        function onFocus() {
            MeanUser.visit();
        };

        if ( /*@cc_on!@*/ false) { // check for Internet Explorer
            document.onfocusin = onFocus;
        } else {
            window.onfocus = onFocus;
        }

        MeanUser.me().then(function(user) {
            MeanUser.setProperty('companies', user.companies);
        }, function(err) {});

        // Default hard coded menu items for main menu
        var defaultMainMenu = [];

        // Query menus added by modules. Only returns menus that user is allowed to see.
        function queryMenu(name, defaultMenu) {

            Menus.query({
                name: name,
                defaultMenu: defaultMenu
            }, function(menu) {
                $scope.menus[name] = menu;
            });
        }

        $scope.companies = false;

        if (Global.user && Global.user.companies) {
            $scope.companies = Global.user.companies;
        }

        $scope.gotToCompany = function(company) {
            $rootScope.selected_company = company;
            GetCompany.set(company);
        }

        $scope.isCollapsed = false;

        $rootScope.$on('loggedin', function() {

            $scope.global.authenticated = !!$rootScope.user;
            $scope.global.user = $rootScope.user;

        });

        MeanSocket.on('user joined', function(data) {
            console.log('event user joined catched');
        });

    }
]);