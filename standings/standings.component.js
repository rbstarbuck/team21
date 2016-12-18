var team21App = angular.module('team21App');


var initStandingsController = function($ctrl, DbService) {
	$ctrl.chartOptions = {
		maintainAspectRatio: false,
		scales: {
			xAxes: [{
				stacked: true,
				ticks: {
					fontSize: 18
				}
			}],
			yAxes: [{
				stacked: true,
				ticks: {
					fontSize: 18
				}
			}]
		},
		legend: {
			display: true,
			labels: {
				fontSize: 18
			}
		},
		tooltips: {
			titleFontSize: 18,
			titleMarginBottom: 12,
			bodyFontSize: 16,
			bodySpacing: 8
		}
	}

	$ctrl.chartLabels = [];
	$ctrl.chartData = [];
	$ctrl.chartSeries = [' Bottles', ' Cans', ' Boxes'];
	$ctrl.orderBy = 'bottleCount + canCount + boxCount DESC';

	$ctrl.dataSources = [
		'Dorms',
		'Individuals'
	];

	$ctrl.dorms = ['Any Dorm'];	
	DbService.query('SELECT dorm FROM Users GROUP BY dorm', [], 'dorm')
	.then(function(data) {
		$ctrl.dorms = $ctrl.dorms.concat(data);
	});

	$ctrl.orderBys = [
		'Score',
		'Name'
	];

	$ctrl.dataSource = $ctrl.dataSources[0];
	$ctrl.dorm = $ctrl.dorms[0];
	$ctrl.orderBy = $ctrl.orderBys[0];
	$ctrl.orderByIsReversed = false;

	return $ctrl;
}


function StandingsController($q, $window, AccountService, DbService) {
	var $ctrl = initStandingsController(this, DbService);

	$ctrl.scanned = {}

	$ctrl.clicked = false;
	$ctrl.messageText = "";
	$ctrl.success = false;

	function gup(name) {
      name = name.replace(/[\[]/,"\\\[").replace(/[\]]/,"\\\]");
      var regexS = "[\\?&]"+name+"=([^&#]*)";
      var regex = new RegExp(regexS);
      var results = regex.exec(window.location.href);
      if(results == null)
        return null;
      else
        return unescape(results[1]);
    }

    $ctrl.showMessage = function()
    {
    	if ($ctrl.clicked == true && AccountService.getIsLoggedIn())
    	{
    		if (AccountService.getCurrentUser().name in $ctrl.scanned)
    		{
    			if ($ctrl.scanned[AccountService.getCurrentUser().name] == true)
    			{
    				return true;
    				$ctrl.scanned[AccountService.getCurrentUser().name] == false
    			}
    		}
    	}

    	else
    	{
    		return false;
    	}
    }

    $ctrl.chooseStyle = function()
    {
    	if ($ctrl.success)
    	{
    		return "success"
    	}

    	else
    	{
    		return "fail"
    	}
    }

    function checkParams()
    {
    	if (AccountService.getIsLoggedIn())
    	{
    		$ctrl.scanned[AccountService.getCurrentUser().name] = true
    		for (i in Object.keys($ctrl.scanned))
    		{
    			if (i != $ctrl.scanned[AccountService.getCurrentUser().name])
    			$ctrl.scanned[i] = false;
    		}
    	}
    	
    	var params = "";

    	if (gup('success') != null)
    	{
    		console.log("success");
    		$ctrl.clicked = true
    		$ctrl.success = true
    		$ctrl.messageText = "Success! You have logged an item with barcode " + gup('success') + ".";
    	}

    	else if (gup('exists') != null)
    	{
    		console.log("exists");
    		$ctrl.clicked = true
    		$ctrl.success = false
    		$ctrl.messageText = "Sorry! This item has already been logged. Try again with a different item!"
    	}
    }
	
	var buildChartDataQuery = function() {
		// build SELECT statement
		switch ($ctrl.dataSource) {
			case 'Dorms':
				var query = 'SELECT dorm AS name, SUM(bottleCount) AS bottleCount, SUM(canCount) AS canCount, SUM(boxCount) AS boxCount, (SUM(bottleCount) + SUM(canCount) + SUM(boxCount)) AS totalCount FROM Users GROUP BY dorm';
				break;

			default: // case 'Individuals'
				var query = 'SELECT name, bottleCount, canCount, boxCount, (bottleCount + canCount + boxCount) AS totalCount FROM Users';
				if ($ctrl.dorm !== 'Any Dorm') {
					query += ' WHERE dorm = "' + $ctrl.dorm + '"';
				}
				break;
		}

		// concat ORDER BY clause
		switch ($ctrl.orderBy) {
			case 'Name':
				query += ' ORDER BY name';
				query += ($ctrl.orderByIsReversed ? ' DESC' : ' ASC');
				break;

			default: // case 'Score'
				query += ' ORDER BY totalCount';
				query += ($ctrl.orderByIsReversed ? ' ASC' : ' DESC');
				break;
		}

		return query;
	}

    // bind to AccountService functions to get automagic updates
    $ctrl.isLoggedIn = AccountService.getIsLoggedIn;

	$ctrl.invalidateChart = function() {
		var query = buildChartDataQuery();
		var keys = ['name', 'bottleCount', 'canCount', 'boxCount'];

		DbService.query(query, [], keys)
		.then(function(data) {
			$ctrl.chartLabels = data[0]; // keys[0]
			$ctrl.chartData = [data[1], data[2], data[3]]; // keys[1-3]
		});
	}

	checkParams();

	// reload the graph data when the db changes
	DbService.addOnChangeListener($ctrl.invalidateChart);

	$ctrl.invalidateChart();
}


team21App.component('standings', {
	templateUrl: 'standings/standings.template.html',
	controller: StandingsController
});
