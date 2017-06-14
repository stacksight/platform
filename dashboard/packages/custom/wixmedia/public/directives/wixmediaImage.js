'use strict';

angular.module('mean.wixmedia').directive('wixmediaImage', ['$uibModal', 'wixmp', 'FileUploader', 'Global', function ($uibModal, wixmp, FileUploader, Global) {
    return {
        restrict: 'E',
        templateUrl: 'wixmedia/views/directives/wixmedia-image.html',
        require: '?ngModel',
        scope: {
            value: '=ngModel',
            placeholderText: '@',
            width: '@',
            height: '@',
            href: '@',
            target: '@'
        },

        link: function ($scope, element, attrs) {
            $scope.global = Global;
            $scope.value = $scope.value || {
                url: '',
                href: '',
                target: null,
                alt: null,
                title: '',
                description: ''
            };

            $scope.href = attrs.href ? attrs.href.toString() : '';
            $scope.placeholderText = attrs.placeholdertext || 'Add Image';
            $scope.isArray = angular.isArray;

            $scope.clear = function () {
                $scope.value.url = '';
            };

            $scope.addImage = function () {
                var width = $scope.width;
                var height = $scope.height;
                var dimensions = (width && height) ? { width: width, height: height } : null;
                wixmp.selectImage(dimensions).then(function (url) {
                    $scope.value.url = url;
                });
            };


            $scope.addHyperlink = function () {
                var modal = $uibModal.open({
                    size: 'lg',
                    templateUrl: 'wixmedia/views/directives/wixmedia-image-link.html',
                    controller: 'DirectiveLinkPage',
                    resolve: {
                        params: function () {
                            return { target: $scope.value.target, href: $scope.value.href }
                        }
                    }
                });

                modal.result.then(function (data) {
                    $scope.value.href = data.href;
                    $scope.value.target = data.target;
                });
            };

            $scope.addSeo = function () {
                var modal = $uibModal.open({
                    size: 'lg',
                    templateUrl: 'wixmedia/views/directives/wixmedia-image-seo.html',
                    controller: 'DirectiveLinkPage',
                    resolve: {
                        params: function () {
                            return {
                                alt: $scope.value.alt,
                                title: $scope.value.title,
                                description: $scope.value.description
                            };
                        }
                    }
                });

                modal.result.then(function (data) {
                    $scope.value.alt = data.alt;
                    $scope.value.title = data.title;
                    $scope.value.description = $scope.value.description;
                });

            };

            $scope.uploader = new FileUploader({
                url: '/wixmedia/upload',
                autoUpload: true,
                onBeforeUploadItem: function () {
                    $scope.uploadInProgress = true
                },
                onCompleteAll: function () {
                    $scope.uploadInProgress = false;
                    //reloadCollections();
                },
                onSuccessItem: function(item, response, status, headers) {
                    $scope.value.url = response.imageUrl;
                    $scope.global.user.profile.pictures.profile = response.imageUrl;
                }
            });
        }
    };
}]);
