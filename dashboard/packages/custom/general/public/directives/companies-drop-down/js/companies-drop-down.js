angular.module('mean.general').directive('companiesDropDown', ['$state', '$stateParams', '$compile', 'Global', 'GetCompany', '$rootScope',
    function($state, $stateParams, $compile, Global, GetCompany, $rootScope) {
        return {
            restrict: 'E',
            replace: true,
            templateUrl: '/general/directives/companies-drop-down/views/companies-drop-down.html',
            scope: {
                selectedStacks: '=selectedStacks'
            },
            link: function(scope, element, attrs) {
                if (Global.user && Global.user.companies){
                    var companies = Global.user.companies;

                    scope.needToShow = false;

                    $rootScope.$on('$stateChangeStart', function(event, toState, toParams, fromState, fromParams){
                        scope.isShowCaret = GetCompany.getCorner(toState);
                        scope.selected_company = GetCompany.get();
                        if(toState.name.indexOf('stack.') > -1 || toState.name.indexOf('company.')){
                            scope.needToShow = true;
                        } else{
                            scope.needToShow = false;
                        }
                    });

                    $rootScope.$watch('stackCompany', function(newVal, oldVal){
                        scope.selected_company = GetCompany.get();
                        if($rootScope.stackCompany && $rootScope.stackCompany.id){
                            scope.stParams = {companyId: $rootScope.stackCompany.id};
                        } else{
                            scope.stParams = {companyId: 'all'};
                        }
                    });

                    scope.stParams = $stateParams;

                    scope.$watch(function(){
                        return $state.$current.name
                    }, function(newVal, oldVal){
                        scope.isShowCaret = GetCompany.getCorner(newVal);
                        scope.selected_company = GetCompany.get();
                        if(newVal.indexOf('stack.') > -1 || newVal.indexOf('company.') > -1 ){
                            scope.needToShow = true;
                        } else{
                            scope.needToShow = false;
                        }
                    });

                    scope.isShowCaret = GetCompany.getCorner();

                    scope.selected_company = GetCompany.get();
                    scope.companies = companies;

                    scope.stateFromView = $state;

                    scope.defaultCompany = {
                        'name': 'All stacks',
                        'id': 'all'
                    };

                    scope.setCompany = function(company){
                        scope.selected_company = company;
                        GetCompany.set(company);
                        scope.isShowCaret = GetCompany.getCorner();
                    }

                    scope.compileTemplate = function(template, index) {
                        if (template) {
                            var tplEl = $compile(template)(scope);
                            $('.template').append(tplEl);
                        }
                    };
                }
            }
        };
    }]);
