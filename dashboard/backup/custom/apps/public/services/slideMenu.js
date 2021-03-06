'use strict';

angular.module('mean.apps').factory('slideMenu', ['Sapi', 'Apps', 'Appsun',
    function(Sapi, Apps, Appsun) {
        var spmenuVerticalWidth;
        spmenuVerticalWidth = 450;
        return {
            slide: function (menu, class_row) {
                $('.tr-stacks-row').removeClass('active');
                if (menu.hasClass("spmenu-right")) {
                    if (menu.hasClass("spmenu-open")) {
                        menu.css("right", parseInt(menu.css("right")) - spmenuVerticalWidth);
                    } else {
                        $('.spmenu').css("right", -spmenuVerticalWidth);
                        $('.spmenu').removeClass("spmenu-open");
                        $('.'+class_row).addClass('active');
                        setTimeout(function(){
                            menu.css("right", parseInt(menu.css("right")) + spmenuVerticalWidth)
                        },
                        200);
                    }
                }
                return menu.toggleClass("spmenu-open");
            }
        };
    }
]);
