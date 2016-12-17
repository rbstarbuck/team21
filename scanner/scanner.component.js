var team21App = angular.module('team21App');


function ScannerController($location, $window, DBService) {
	var $ctrl = this;

    // use these functions for getting the current user
    // you can bind them to the template and they'll update automatically, e.g. to ngHide parts that require a user to be logged in
    $ctrl.isLoggedIn = AccountService.getIsLoggedIn;
    $ctrl.currentUser = AccountService.getCurrentUser; // null if not logged in, else an object like {username: string, name: string, bottleCount: int, ...}

    $ctrl.openScanner = function() {
      Quagga.init({
          inputStream : {
            name : "Live",
            type : "LiveStream",
            target: document.querySelector('#scannerDiv')    // Or '#yourElement' (optional)
          },
          decoder : {
            readers : ["upc_reader"]
          }
        },
        function(err) {
          if (err) {
            console.log(err);
            return
          }
          console.log("Initialization finished. Ready to start");
          Quagga.start();
        }
      );
      Quagga.onDetected($ctrl.scannerDetectedCallback);
    }

    $ctrl.scannerDetectedCallback = function(data) {
      Quagga.stop();
      window.alert(data.codeResult.code);
      $window.location.href = '#!/';
    }

    // use this to update any recyclable counts being displayed on the page via SELECT query
    $ctrl.updateCounts = function() {

    }

    $ctrl.openScanner();

    // ...and now, the counts will automatically update if you INSERT, DELETE, or UPDATE the db after an item is scanned
	DbService.addOnChangeListener($ctrl.updateCounts);

	// and you'll probably want to set the counts on page load
	$ctrl.updateCounts();
}


team21App.component('scanner', {
    templateUrl: 'scanner/scanner.template.html',
    controller: ScannerController
});
