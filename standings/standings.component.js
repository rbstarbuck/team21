var team21App = angular.module('team21App');

function StandingsController(DbService) {
	var self = this;

	self.users = "Loading";
	self.dorms = "Loading";

	DbService.selectAll("Users")
	.then(function(data) {
		self.users = JSON.stringify(data);
	});

	DbService.selectAll("Dorms")
	.then(function(data) {
		self.dorms = JSON.stringify(data);
	});
}

team21App.component('standings', {
	templateUrl: 'standings/standings.template.html',
	controller: StandingsController
});
