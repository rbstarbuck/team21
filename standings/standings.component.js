var team21App = angular.module('team21App');

function StandingsController($q, DbService) {
	var self = this;

	// TODO: delete below
	self.users = "Loading";
	self.dorms = "Loading";

	DbService.query(
		"SELECT * FROM Users ORDER BY ? + ? + ? DESC", // the query string
		["bottleCount", "canCount", "boxCount"], // optional: replaces any '?' in query string (string or array)
		["bottleCount", "canCount", "boxCount"]) // optional: returned array will contain the values (not keys) associated with these keys
												 //   if an array of keys is passed, an array (by key) of arrays (by row) is returned
												 //   if a single key (string) is passed, a single array of values is returned
	.then(function(data) {
		self.users = JSON.stringify(data);
	});

	DbService.query("SELECT * FROM Dorms")
	.then(function(data) {
		self.dorms = JSON.stringify(data);
	});
	// TODO: delete above

	self.chartOptions = {
		scales: {
			xAxes: [{
			  stacked: true,
			}],
			yAxes: [{
			  stacked: true
			}]
		}
	}

	self.chartLabels = [];
	self.chartData = [];
	self.chartSeries = ['bottleCount', 'canCount', 'boxCount'];
	self.orderBy = 'bottleCount + canCount + boxCount DESC';

	var getChartData = function() {
		DbService.query('SELECT * FROM Users ORDER BY ?', self.orderBy, ['name', 'bottleCount', 'canCount', 'boxCount'])
		.then(function(data) {
			self.chartLabels = data[0];
			self.chartData = [data[1], data[2], data[3]];
		});
	}

	getChartData();
}

team21App.component('standings', {
	templateUrl: 'standings/standings.template.html',
	controller: StandingsController
});
