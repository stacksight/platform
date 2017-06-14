'use strict';

angular.module('mean.general').factory('ShowHits', ['$q', '$state',
    function($q, $state) {
        return {
            getStorage: function(){
                if (!window.localStorage) {
                    window.localStorage = {
                        getItem: function (sKey) {
                            if (!sKey || !this.hasOwnProperty(sKey)) { return null; }
                            return unescape(document.cookie.replace(new RegExp("(?:^|.*;\\s*)" + escape(sKey).replace(/[\-\.\+\*]/g, "\\$&") + "\\s*\\=\\s*((?:[^;](?!;))*[^;]?).*"), "$1"));
                        },
                        key: function (nKeyId) {
                            return unescape(document.cookie.replace(/\s*\=(?:.(?!;))*$/, "").split(/\s*\=(?:[^;](?!;))*[^;]?;\s*/)[nKeyId]);
                        },
                        setItem: function (sKey, sValue) {
                            if(!sKey) { return; }
                            document.cookie = escape(sKey) + "=" + escape(sValue) + "; expires=Tue, 19 Jan 2038 03:14:07 GMT; path=/";
                            this.length = document.cookie.match(/\=/g).length;
                        },
                        length: 0,
                        removeItem: function (sKey) {
                            if (!sKey || !this.hasOwnProperty(sKey)) { return; }
                            document.cookie = escape(sKey) + "=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/";
                            this.length--;
                        },
                        hasOwnProperty: function (sKey) {
                            return (new RegExp("(?:^|;\\s*)" + escape(sKey).replace(/[\-\.\+\*]/g, "\\$&") + "\\s*\\=")).test(document.cookie);
                        }
                    };
                    window.localStorage.length = (document.cookie.match(/\=/g) || window.localStorage).length;
                }
                return localStorage;
            },
            clear: function(){
                var storage = this.getStorage();
                storage.setItem('hint-drop-down-companies-show', false);
                storage.setItem('hint-add-stack-button', false);
                storage.setItem('hint-for-events-description', false);
                storage.setItem('search_event_type_options', false);
                return this;
            },
            show: function(){
                var options = [];
                var storage = this.getStorage();
                //hint-drop-down-companies-show
                //hint-add-stack-button
                //hint-for-events-description
                //search_event_type_options
                var hint_drop_down_companies_show = storage.getItem('hint-drop-down-companies-show');
                if(!hint_drop_down_companies_show || hint_drop_down_companies_show == "false"){
                    options.push({
                        id: 'hint-drop-down-companies-show',
                        element: document.querySelectorAll('#hint-drop-down-companies-show')[0],
                        hint: "Switch between Teams, or display all of your stacks. Use this drop down to narrow down the list of stacks below to only show stacks of a certain team.",
                        hintPosition: 'right'
                    });
                }
                var hint_add_stack_button = storage.getItem('hint-add-stack-button');
                if(!hint_add_stack_button || hint_add_stack_button == "false"){
                    options.push({
                        id: 'hint-add-stack-button',
                        element: document.querySelectorAll('#hint-add-stack-button')[0],
                        hint: "Add more websites to your dashboard. The more stacks you have, the more insights you're going to get!",
                        hintPosition: 'right'
                    });
                }
                var hint_for_events_description = storage.getItem('hint-for-events-description');
                if(!hint_for_events_description || hint_for_events_description == "false"){
                    options.push({
                        id: 'hint-for-events-description',
                        element: document.querySelectorAll('#hint-for-events-description')[0],
                        hint: "The events live stream shows you what exactly is happening with your stacks, so you can have complete control over the activity of your stack, know who's logging in, which content they edit or comment on, or which administrative operations they do. The event stream can also display development activity such as new issues or modification of the code.",
                        hintPosition: 'right'
                    });
                }
                var search_event_type_options = storage.getItem('search_event_type_options');
                if(!search_event_type_options || search_event_type_options == "false"){
                    options.push({
                        id: 'search_event_type_options',
                        element: document.querySelectorAll('#search_event_type_options')[0],
                        hint: "Use the filters to narrow down the list and concentrate only on a specific type of event.",
                        hintPosition: 'right'
                    });
                }
                if($state.current.name == 'company.main.dashboard' || $state.current.name == 'company.main.dashboard.tour'){
                    var intro = introJs();
                    intro.setOptions({
                        hints: options,
                        hintButtonLabel: "Ok"
                    });
                    intro.addHints();
                    intro.showHints();
                    intro.onhintclose(function(index) {
                        storage.setItem(options[index].id, true);
                    });
                }
            }
        };
    }
]);