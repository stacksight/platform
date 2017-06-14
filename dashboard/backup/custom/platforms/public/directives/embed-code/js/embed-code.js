'use strict';

angular.module('mean.platforms').directive('embedCode', ['Global', function(Global) {
    return {
        restrict: 'E',
        replace: true,
        templateUrl: '/platforms/directives/embed-code/views/embed-code.html',
        link: function(scope, element, attrs) {

            scope.data = {};
            scope.data.platform = scope.platform;
            scope.data.platform = (scope.data.platform === 'drupal') ? 'drupal7' : scope.data.platform;
            
            scope.text = {};
            scope.text.wordpress = '// StackSight start config\n';
            scope.text.wordpress += '$ss_inc = dirname(__FILE__) . \'/wp-content/plugins/stacksight/stacksight-php-sdk/bootstrap-wp.php\';\n';
            scope.text.wordpress += 'if(is_file($ss_inc)) {\n';
            scope.text.wordpress += '    define(\'STACKSIGHT_TOKEN\', \'' + scope.app.author.token + '\');\n'
            scope.text.wordpress += '    define(\'STACKSIGHT_GROUP\', \'' + scope.app.name + '\');\n';
            scope.text.wordpress += '    require_once($ss_inc);\n';
            scope.text.wordpress += '}\n'
            scope.text.wordpress += '// StackSight end config';

            scope.text.drupal6 = '// StackSight start config\n';
            scope.text.drupal6 += '$ss_inc = DRUPAL_ROOT . \'/sites/all/modules/stacksight/stacksight-php-sdk/bootstrap-drupal-6.php\';\n';
            scope.text.drupal6 += 'if(is_file($ss_inc)) {\n';
            scope.text.drupal6 += '    define(\'STACKSIGHT_TOKEN\', \'' + scope.app.author.token + '\');\n'
            scope.text.drupal6 += '    define(\'STACKSIGHT_GROUP\', \'' + scope.app.name + '\');\n';
            scope.text.drupal6 += '    require_once($ss_inc);\n';
            scope.text.drupal6 += '}\n'
            scope.text.drupal6 += '// StackSight end config';

            scope.text.drupal7 = '// StackSight start config\n';
            scope.text.drupal7 += '$ss_inc = DRUPAL_ROOT . \'/sites/all/modules/stacksight/stacksight-php-sdk/bootstrap-drupal-7.php\';\n';
            scope.text.drupal7 += 'if(is_file($ss_inc)) {\n';
            scope.text.drupal7 += '    define(\'STACKSIGHT_TOKEN\', \'' + scope.app.author.token + '\');\n'
            scope.text.drupal7 += '    define(\'STACKSIGHT_GROUP\', \'' + scope.app.name + '\');\n';
            scope.text.drupal7 += '    require_once($ss_inc);\n';
            scope.text.drupal7 += '}\n'
            scope.text.drupal7 += '// StackSight end config';

            scope.text.drupal8 = '// StackSight start config\n';
            scope.text.drupal8 += '$ss_inc = DRUPAL_ROOT . \'/sites/all/modules/stacksight/stacksight-php-sdk/bootstrap-drupal-8.php\';\n';
            scope.text.drupal8 += 'if(is_file($ss_inc)) {\n';
            scope.text.drupal8 += '    define(\'STACKSIGHT_TOKEN\', \'' + scope.app.author.token + '\');\n'
            scope.text.drupal8 += '    define(\'STACKSIGHT_GROUP\', \'' + scope.app.name + '\');\n';
            scope.text.drupal8 += '    require_once($ss_inc);\n';
            scope.text.drupal8 += '}\n'
            scope.text.drupal8 += '// StackSight end config';


        },
        scope: {
            app: '=',
            platform: '@',
            src: '@'
        }
    };
}]);
