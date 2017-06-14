'use strict';

/* jshint -W098 */
angular.module('mean.oauth').controller('OauthController', ['$scope', '$http', '$location', 'Global', 'Oauth', 'Appsun', 'Sapi',
    '$state',
  function($scope, $http, $location, Global, Oauth, Appsun, Sapi, $state) {
    $scope.global = Global;
    $scope.status = 'Please wait';
    var code = $location.search().code;
    var state = $location.search().state;
    if(code){
      console.log('Code is:'+code);
      Sapi.post({
        cmd_api: '/oauth/slack/check',
        data: {code: code, state: state}
      }).then(function(response) {
        $scope.status = '';
        if(response.ok == true){
          $scope.global.user.oauth_slack = response.upsession.value.oauth_slack
          swal({title: "Success!", text:  "Slack added", type: "success"}, function(){
            $state.go('profile.slack');
          });
        } else{
          swal({title: "Error!", text:  "Error code: "+response.error, type: "error"}, function(){
            $state.go('profile.slack');
          });
        }
      }, function(error_response) {
        $scope.status = '';
        swal({title: "Error!", text: "Error code: "+error_response.status, type: "error"}, function(){
          $state.go('profile.slack');
        });
        console.log('******** OAuth error *********', error_response);
      });
    } else{
      $state.go('profile.slack');
      console.log('Redirect to apps page');
    }
  }
]);
