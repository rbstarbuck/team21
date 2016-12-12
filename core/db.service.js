var team21App = angular.module('team21App');


function DbService($q, $http) {
    var self = this;

    var dbCache = null;
    self.getDb = function() {
        if (!dbCache) {
            deferred = $q.defer();
            dbCache = deferred.promise;

            var db = openDatabase('team21db', '1.0', 'EECS 493 Team 21 DB', 2 * 1024 * 1024);

            $q.all([
                $http.get('core/users.data.json'),
                $http.get('core/dorms.data.json')
            ]).then(function(data) {
                var users = data[0].data.data;
                var dorms = data[1].data.data;
                
                db.transaction(function(tx) {
                    tx.executeSql('CREATE TABLE IF NOT EXISTS Users (username PRIMARY KEY, password, name, bottleCount, canCount, boxCount)');
                    for (var i = 0; i < users.length; ++i) {
                        var user = users[i];
                        tx.executeSql('INSERT INTO Users VALUES (?, ?, ?, ?, ?, ?)', [user.username, user.password, user.name, user.recyclables.bottles, user.recyclables.cans, user.recyclables.boxes]);
                    }

                    tx.executeSql('CREATE TABLE IF NOT EXISTS Dorms (name PRIMARY KEY)');
                    for (var i = 0; i < dorms.length; ++i) {
                        var dorm = dorms[i];
                        tx.executeSql('INSERT INTO Dorms VALUES (?)', [dorm]);
                    }

                    deferred.resolve(db);
                });
            }).catch(function(e) {
                // error getting local JSON files
                console.log(e);
                deferred.reject(e);
            });
        };

        return dbCache;
    }

    self.query = function(q, params = [], filterValue = undefined) {
        var deferred = $q.defer();

        self.getDb()
        .then(function(db) {
            if (typeof(params) === 'string') {
                params = [params];
            }
            db.transaction(function(tx) {
                tx.executeSql(q, params, function(tx, results) {
                    var arr = [];
                    if (typeof(filterValue) === 'string') {
                        for (var i = 0; i < results.rows.length; ++i) {
                            arr.push(results.rows.item(i)[filterValue]);
                        }
                    }
                    else if (typeof(filterValue) === 'object') {
                        for (var j = 0; j < filterValue.length; ++j) {
                            var values = [];
                            var filter = filterValue[j];
                            for (var i = 0; i < results.rows.length; ++i) {
                                values.push(results.rows.item(i)[filter]);
                            }
                            arr.push(values);
                        }
                    }
                    else {
                        for (var i = 0; i < results.rows.length; ++i) {
                            arr.push(results.rows.item(i));
                        }
                    }
                    deferred.resolve(arr);
                }, function(tx, err) {
                    console.log(err);
                    deferred.reject(err);
                });
            });
        })

        return deferred.promise;
    }
}

team21App.service('DbService', DbService);
