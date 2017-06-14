angular.module('mean.general').directive('textSelection', ['$http', function($http) {
    return {
        restrict: 'A',
        link: function(scope, element, attrs) {
            element.on('mouseup', function(e) {
                var range = window.getSelection() || document.getSelection() || document.selection.createRange();
                var word = range.toString().trim();
                if(word !== '') {

                    swal({
                        title: "",   
                        text: "Do you want to create a gist file?",
                        type: "info",   
                        showCancelButton: true,   
                        // confirmButtonColor: "#DD6B55",   
                        confirmButtonText: "Yes",   
                        cancelButtonText: "No",   
                        closeOnConfirm: true,   
                        closeOnCancel: true 
                    }, function(isConfirm){
                            if (isConfirm) {
                                var req = {
                                    method: 'POST',
                                    url: 'https://api.github.com/gists',
                                    headers: {
                                        'Accept': 'application/vnd.github.v3+json'
                                    },
                                    data: {
                                        'description': 'Gist from mean network',
                                        'public': false,
                                        'files': {
                                            'test.txt': {
                                                'content': word
                                            }
                                        }
                                    }
                                };

                                $http(req).success(function(data, status, headers, config){
                                    swal({
                                        title: 'Gist repo created!',
                                        text: '<a href="' + data.html_url + '" target="_blank" >link to gist</a>',
                                        type: 'success',
                                        showCancelButton: false,
                                        closeOnConfirm: false,
                                        animation: "slide-from-top",
                                        html: true
                                    });
                                }).error(function(data, status, headers, config){
                                    console.log('Error on create gist', data, status);
                                }); 
                            }
                    });
                }
                e.stopPropagation();
            });      
        }
    }
}]);
