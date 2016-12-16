var team21App = angular.module('team21App', [
    'ngRoute',
    'ui.bootstrap',
    'chart.js'
]);

team21App.config(['$routeProvider', function($routeProvider) {
    $routeProvider
    .when("/", {
        template: '<standings></standings>'
    })
    .when("/scan", {
        template: '<scanner></scanner>'
    });
}]);

team21App.config(['$qProvider', function($qProvider) {
    $qProvider.errorOnUnhandledRejections(false);
}]);
