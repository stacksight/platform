angular.module('mean.stack')
    .config(function($tooltipProvider) {
        $tooltipProvider.setTriggers({'open': 'close'});
    })
    .directive('popoverToggle', function() {
        return {
            scope: true,
            controller: function ($element, $timeout) {
                var ctrl = this;
                ctrl.toggle = function() {
                    $timeout(function() {
                        ctrl.openned = !ctrl.openned;
                        $element.triggerHandler(ctrl.openned ? 'close' : 'open');
                        if(ctrl.openned){
                            $element.scope().isOpen = true;
                        } else{
                            $element.scope().isOpen = false;
                        }
                        $element.scope().$apply();
                    });
                }
            },
            controllerAs: 'popoverCtrl',
            link: function(scope, element, attrs, popoverCtrl) {
                return element.on('click', popoverCtrl.toggle);
            }
        };
    });
