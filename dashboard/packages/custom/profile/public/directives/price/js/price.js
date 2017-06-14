angular.module('mean.profile').directive('price', opinions);

function opinions(Global, $http, $stateParams, Billing) {
    var directive = {
        link: link,
        templateUrl: '/profile/directives/price/views/price.html',
        restrict: 'E',
        scope: {
            options: '=',
            vmb: '='
        }
    };
    return directive;
    function link(scope, element, attrs) {
        scope.global = Global;

        Billing.plans(null, function(err, data) {
            scope.price = data.plans;
        });

        scope.selected_plan = false;

        scope.subscribe = function(plan){
            scope.selected_plan = plan;
            scope.vmb.getPlans(plan._id);
            $('#customer_opinion .opinions').fadeOut();
            $('#plan_cards').fadeOut();
            var total_plan = $('#plan_'+plan._id).clone();
            total_plan.css('display', 'none');
            $('#plan_cards_dyn').append(total_plan);
            setTimeout(function(){
                $('#plan_cards_dyn #plan_'+plan._id).fadeIn();
                $('#upgrade_form_block').fadeIn();
            }, 600);
        }

        scope.cancel = function(plan){
            $('#plan_cards_dyn #plan_'+plan._id).fadeOut();
            $('#upgrade_form_block').fadeOut();
            setTimeout(function(){
                $('#customer_opinion .opinions').fadeIn();
                $('#plan_cards').fadeIn();
                $('#plan_cards_dyn #plan_'+plan._id).remove();
            }, 600);

        }
    }
}