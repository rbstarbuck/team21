var team21App = angular.module('team21App');


function AccountService($q, DbService) {
    var self = this;

    // the user that's currently logged in; null if no login
    // stores entire row from Users table, see DbService for schema
    var currentUser = null;

    // grab a ref to this function in controller scope to see updates automagically via binding
    self.getCurrentUser = function() {
        return currentUser;
    }

    // grab a ref to this function in controller scope to see updates automagically via binding
    self.getIsLoggedIn = function() {
        return currentUser != null;
    }

    self.doesUserExist = function(username) {
        var deferred = $q.defer();

        var query = 'SELECT COUNT(*) AS count FROM Users WHERE username=?';
        DbService.query(query, username, 'count')
        .then(function(count) {
            deferred.resolve(count > 0);
        }).catch(function(err) {
            console.log(err);
            deferred.reject(err);
        });

        return deferred.promise;
    }

    self.login = function(username, password) {
        var deferred = $q.defer();

        // query db for User matching given username/password
        var query = 'SELECT * FROM Users WHERE username=? AND password=?';
        DbService.query(query, [username, password])
        .then(function(results) {
            if (results.length > 0) {
                // login was successful
                currentUser = results[0];
                deferred.resolve(true);
            }
            else {
                // bad username or password
                deferred.resolve(false);
            }
        }).catch(function(err) {
            // something went wrong during db query, this shouldn't happen
            console.log(err);
            deferred.reject(err);
        });

        return deferred.promise;
    }

    self.logout = function() {
        currentUser = null;
    }

    self.createUser = function(username, password, displayName, dorm) {
        var deferred = $q.defer();

        var query = 'INSERT INTO Users (username, password, name, dorm, bottleCount, canCount, boxCount) VALUES (?, ?, ?, ?, 0, 0, 0)';
        DbService.query(query, [username, password, displayName, dorm])
        .then(function(data) {
            deferred.resolve();
        }).catch(function(err) {
            console.log(err);
            deferred.reject(err);
        });

        return deferred.promise;
    }
}


team21App.service('AccountService', AccountService);
