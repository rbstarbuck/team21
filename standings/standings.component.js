var team21App = angular.module('team21App');


var initStandingsController = function(ctrl, DbService) {
	ctrl.chartOptions = {
		scales: {
			xAxes: [{
				stacked: true,
			}],
			yAxes: [{
				stacked: true
			}]
		}
	}

	ctrl.chartLabels = [];
	ctrl.chartData = [];
	ctrl.chartSeries = ['bottleCount', 'canCount', 'boxCount'];
	ctrl.orderBy = 'bottleCount + canCount + boxCount DESC';

	ctrl.dataSources = [
		'Dorms',
		'Individuals'
	];

	ctrl.dorms = ['Any Dorm'];	
	DbService.query('SELECT dorm FROM Users GROUP BY dorm', [], 'dorm')
	.then(function(data) {
		ctrl.dorms = ctrl.dorms.concat(data);
	});

	ctrl.orderBys = [
		'Score',
		'Name'
	];

	ctrl.dataSource = ctrl.dataSources[0];
	ctrl.dorm = ctrl.dorms[0];
	ctrl.orderBy = ctrl.orderBys[0];
	ctrl.orderByIsReversed = false;

	return ctrl;
}


function StandingsController($q, DbService) {
	var ctrl = initStandingsController(this, DbService);
	

	// TODO: delete below
	ctrl.usersString = "Loading";
	ctrl.dormsString = "Loading";

	DbService.query(
		"SELECT * FROM Users ORDER BY ? + ? + ? DESC", // the query string, standard SQL syntax
		["bottleCount", "canCount", "boxCount"], // optional: replaces any '?' in query string (pass a string or array)
												 //   WebSQL doesn't like '?' in some places, so be careful (just use string concats if it doesn't work)
		["bottleCount", "canCount", "boxCount"]) // optional: returned array will contain the values (not keys) associated with these keys
												 //   if an array of keys is passed, an array (by key) of arrays (values by row) is returned
												 //   if a single key (string) is passed, a single array of values is returned
	.then(function(data) {  // returns a promise; use .then() for callback, .catch() for handling error
		ctrl.usersString = JSON.stringify(data);
	});

	DbService.query("SELECT * FROM Dorms", [], 'name')
	.then(function(data) {
		ctrl.dormsString = JSON.stringify(data);
	});
	// TODO: delete above


	(ctrl.invalidateChart = function() {
		// build SELECT statement
		switch (ctrl.dataSource) {
			case 'Dorms':
				var query = 'SELECT dorm AS name, SUM(bottleCount) AS bottleCount, SUM(canCount) AS canCount, SUM(boxCount) AS boxCount, (SUM(bottleCount) + SUM(canCount) + SUM(boxCount)) AS totalCount FROM Users GROUP BY dorm';
				break;

			default: // case 'Individuals'
				var query = 'SELECT name, bottleCount, canCount, boxCount, (bottleCount + canCount + boxCount) AS totalCount FROM Users';
				if (ctrl.dorm !== 'Any Dorm') {
					query += ' WHERE dorm = "' + ctrl.dorm + '"';
				}
				break;
		}

		// concat ORDER BY clause
		switch (ctrl.orderBy) {
			case 'Name':
				query += ' ORDER BY name';
				query += (ctrl.orderByIsReversed ? ' DESC' : ' ASC');
				break;

			default: // case 'Score'
				query += ' ORDER BY totalCount';
				query += (ctrl.orderByIsReversed ? ' ASC' : ' DESC');
				break;
		}
		
		// format query return value
		var keys = ['name', 'bottleCount', 'canCount', 'boxCount'];

		// query for chart data
		DbService.query(query, [], keys)
		.then(function(data) {
			ctrl.chartLabels = data[0]; // keys[0]
			ctrl.chartData = [data[1], data[2], data[3]]; // keys[1-3]
		});
	})(); // execute on load
}


team21App.component('standings', {
	templateUrl: 'standings/standings.template.html',
	controller: StandingsController
});
