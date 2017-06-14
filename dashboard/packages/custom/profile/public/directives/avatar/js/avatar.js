angular
    .module('mean.profile')
    .directive('avatar', avatar);

function avatar(Global, Profile, $location) {
    var directive = {
        link: link,
        templateUrl: '/profile/directives/avatar/views/avatar.html',
        restrict: 'E',
        scope: {
            options: '='
        }
    };
    return directive;

    function link(scope, element, attrs) {
        scope.global = Global;
        scope.fileDest = '/photos/' + scope.global.user._id + '/';

        scope.uploadPicCallback = function(file) {
            var profile = scope.global.user.profile;

            var src = $location.protocol() + '://' + $location.host() + file.src;
            profile.pic = src;

            Profile.save(profile).then(function(data) {
                sweetAlert('success', '', 'success');
            }, function(data) {
                sweetAlert('failed','', 'error');
            });
        };


    }
}