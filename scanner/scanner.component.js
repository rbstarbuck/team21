var team21App = angular.module('team21App');


function ScannerController() {
	var $ctrl = this;

    // use these functions for getting the current user
    // you can bind them to the template and they'll update automatically, e.g. to ngHide parts that require a user to be logged in
    $ctrl.isLoggedIn = AccountService.getIsLoggedIn;
    $ctrl.currentUser = AccountService.getCurrentUser; // null if not logged in, else an object like {username: string, name: string, bottleCount: int, ...}

    // use this to update any recyclable counts being displayed on the page via SELECT query
    $ctrl.updateCounts = function() {

    }

    // ...and now, the counts will automatically update if you INSERT, DELETE, or UPDATE the db after an item is scanned
	DbService.addOnChangeListener($ctrl.updateCounts);

	// and you'll probably want to set the counts on page load
	$ctrl.updateCounts();
}


team21App.component('scanner', {
    templateUrl: 'scanner/scanner.template.html',
    controller: ScannerController
});
