var team21App = angular.module('team21App');

function StandingsController($q, DbService) {
	var self = this;

	// TODO: delete below
	self.users = "Loading";
	self.dorms = "Loading";

	DbService.query(
		"SELECT * FROM Users ORDER BY ? + ? + ? DESC", // the query string
		["bottleCount", "canCount", "boxCount"], // optional: replaces any '?' in query string
		["bottleCount", "canCount", "boxCount"]) // optional: returned array will have values only (else keys are included and each array item is an object); specify values with string (for one value) or array
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
		var query = 'SELECT (?) FROM Users ORDER BY ' + self.orderBy;
		$q.all([
			DbService.query('SELECT name FROM Users ORDER BY ?', self.orderBy, 'name'),
			DbService.query('SELECT bottleCount FROM Users ORDER BY ?', self.orderBy, 'bottleCount'),
			DbService.query('SELECT canCount FROM Users ORDER BY ?', self.orderBy, 'canCount'),
			DbService.query('SELECT boxCount FROM Users ORDER BY ?', self.orderBy, 'boxCount')
		]).then(function(data) {
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
