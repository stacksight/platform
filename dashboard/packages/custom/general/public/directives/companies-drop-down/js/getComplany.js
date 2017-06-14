'use strict';

angular.module('mean.general').factory('GetCompany', ['$http', '$q', 'Sapi', 'Global', '$stateParams', '$state', '_', 'Stack', '$rootScope',
    function($http, $q, Sapi, Global, $stateParams, $state, _, Stack, $rootScope) {
        return {
            get: function(profile) {
                if (Global.user && Global.user.companies){
                    var companies = Global.user.companies;
                    var parent = this;
                    var defaultCompany = {
                        'name': 'All stacks',
                        'id': 'all'
                    };
                    var company = {};

                    if($state.current.name == 'company.main.dashboard' ||
                        $state.current.name == 'company.main.dashboard.withparam' ||
                        $state.current.name == 'company.main.dashboard.tour' ||
                        $state.current.name == 'company.main.inventory' ||
                        $state.current.name == 'company.main.people'){
                        if($state.params && $state.params.companyId){
                            if($state.params.companyId == 'all'){
                                parent.set(defaultCompany);
                                return defaultCompany;
                            }

                            var returned_company = _.findWhere(companies, {id: $state.params.companyId});

                            if(returned_company){
                                parent.set(returned_company);
                                return returned_company;
                            } else{
                                parent.set(defaultCompany);
                                return defaultCompany;
                            }
                        }
                    } else if(!parent.getCorner()){ // If we're on stack page
                        if($rootScope.stackCompany){
                            return $rootScope.stackCompany;
                        } else{
                            return {id: false, name: ''};
                        }
                    }

                    return company || companies[0];
                }
                return false;
            },
            set: function(company){
                if (Global.user && Global.user.companies){
                    var toState = 'company.main.dashboard';

                    if($state.current.name == 'company.main.dashboard' ||
                        $state.current.name == 'company.main.dashboard.withparam' ||
                        $state.current.name == 'company.main.dashboard.tour' ||
                        $state.current.name == 'company.main.inventory' ||
                        $state.current.name == 'company.main.people'){
                        toState = $state.current.name;
                    }

                    $state.go(toState, {companyId: company.id});
                }
            },
            getCorner: function(toState){
                if (Global.user && Global.user.companies) {
                    if(!toState || !toState.name){
                        toState = $state.get($state.current);
                    }
                    if(toState.name.indexOf('stack.') > -1) {
                        return false;
                    }
                    return true;
                }
            }
        };
    }
]);