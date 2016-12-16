var team21App = angular.module('team21App', [
	'ui.bootstrap',
    'chart.js'
]);

team21App.config(['$qProvider', function ($qProvider) {
    $qProvider.errorOnUnhandledRejections(false);
}]);
