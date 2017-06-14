'use strict';

angular.module('mean.stacks').factory('slideMenu', ['Sapi', 'Apps', 'Appsun',
    function(Sapi, Apps, Appsun) {
        var spmenuVerticalWidth;
        spmenuVerticalWidth = 450;
        return {
            slide: function (menu, class_row) {
                $('.tr-stacks-row').removeClass('active');
                if (menu.hasClass("spmenu-right")) {
                    if (menu.hasClass("spmenu-open")) {
                        menu.css("right", parseInt(-spmenuVerticalWidth));
                    } else {
                        $('.spmenu').css("right", -spmenuVerticalWidth);
                        $('.spmenu').removeClass("spmenu-open");
                        $('.'+class_row).addClass('active');
                        setTimeout(function(){
                            menu.css("right", 0)
                        },
                        200);
                    }
                }
                return menu.toggleClass("spmenu-open");
            },
            hide: function(menu, class_row){
                if (menu.hasClass("spmenu-open")) {
                    menu.css("right", parseInt(-spmenuVerticalWidth));
                    $('.spmenu').removeClass("spmenu-open");
                }
                return this;
            },
            isOpen: function(menu){
                if (menu.hasClass("spmenu-open")) return true;
                return false;
            }
        };
    }
]);
