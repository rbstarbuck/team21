var team21App = angular.module('team21App');


function DbService($q, $http) {
    var self = this;

    var onChangeListeners = [];

    self.addOnChangeListener = function(listener) {
        onChangeListeners.push(listener);
    }

    var signalOnChangeListeners = function() {
        for (var i = 0; i < onChangeListeners.length; ++i) {
            onChangeListeners[i]();
        }
    }
    var dbCache = null;
    self.getDb = function() {
        if (!dbCache) { // first getDb() call, initialize cache
            deferred = $q.defer();
            dbCache = deferred.promise;

            // creates new db if none exists, else opens existing db
            var db = openDatabase('team21db', '1.0', 'EECS 493 Team 21 DB', 2 * 1024 * 1024);

            // get db initialization data
            $q.all([
                $http.get('core/users.data.json'),
                $http.get('core/dorms.data.json'),
                $http.get('core/recyclables.data.json')
            // fill tables with initialization data
            ]).then(function(data) {
                var users = data[0].data.data;
                var dorms = data[1].data.data;
                var recyclables = data[2].data.data;

                // perform SQL queries to make tables
                db.transaction(function(tx) {
                    // make and fill Users table
                    
                    tx.executeSql('CREATE TABLE IF NOT EXISTS Users (username PRIMARY KEY, password, name, dorm, pic, bottleCount, canCount, boxCount)');
                    for (var i = 0; i < users.length; ++i) {
                        var user = users[i];
                        tx.executeSql('INSERT INTO Users VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
                            [user.username, user.password, user.name, user.dorm, user.pic,
                             user.recyclables.bottles, user.recyclables.cans, user.recyclables.boxes]
                        );
                    }

                    // make and fill Dorms table
                    tx.executeSql('CREATE TABLE IF NOT EXISTS Dorms (name PRIMARY KEY)');
                    for (var i = 0; i < dorms.length; ++i) {
                        var dorm = dorms[i];
                        tx.executeSql('INSERT INTO Dorms VALUES (?)', [dorm]);
                    }

                    tx.executeSql('CREATE TABLE IF NOT EXISTS Recyclables (code PRIMARY KEY)');
                    for (var i = 0; i < recyclables.length; ++i) {
                        var recyclable = recyclables[i];
                        tx.executeSql('INSERT INTO Recyclables VALUES (?)', [recyclable]);
                    }

                    // done, resolve promise
                    deferred.resolve(db);
                });
            // log error getting local JSON files if they occur
            }).catch(function(e) {
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
            // convenience, allow string to be passed when only one prepared statement param is needed
            if (typeof(params) === 'string') {
                params = [params];
            }

            // perform SQL query
            db.transaction(function(tx) {
                tx.executeSql(q, params, function(tx, results) {
                    // build an array from results (WebSQL results are ugly, let's clean them up)
                    var arr = [];

                    // if one column filter, make one array of values
                    if (typeof(filterValue) === 'string') {
                        for (var i = 0; i < results.rows.length; ++i) {
                            arr.push(results.rows.item(i)[filterValue]);
                        }
                    }
                    // if multiple column filters, make an array of arrays of values
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
                    // if no column filters, make one array of keys and values
                    else {
                        for (var i = 0; i < results.rows.length; ++i) {
                            arr.push(results.rows.item(i));
                        }
                    }

                    // done, resolve promise
                    if (!q.toLowerCase().startsWith("select")) {
                        signalOnChangeListeners();
                    }
                    deferred.resolve(arr);
                // log SQL query errors if they occur
                }, function(tx, err) {
                    console.log(err);
                    deferred.reject(err);
                });
            });
        })

        return deferred.promise;
    }

    self.addRecyclable = function(params, success){
        var name = params.user.username;
        var code = params.data;
        var type = params.recType;
        // creates new db if none exists, else opens existing db
        var db = openDatabase('team21db', '1.0', 'EECS 493 Team 21 DB', 2 * 1024 * 1024);

        // perform SQL queries to make tables
        db.transaction(function(tx) {
            console.log(name);
            console.log(code);
            console.log(type);
            tx.executeSql('SELECT * From Recyclables WHERE code=?', [code], function(tx, results){
                if(results.rows.length != 0){
                    success("exists");
                }
                else{
                    // make and fill Users table
                    tx.executeSql('INSERT INTO Recyclables VALUES(?)', [code]);

                    if (type == 'bottle') {
                        tx.executeSql('UPDATE Users SET bottleCount=bottleCount+1 WHERE username=?', [name]);
                    }

                    else if (type == 'can') {
                        tx.executeSql('UPDATE Users SET canCount=canCount+1 WHERE username=?', [name]);
                    }

                    else {
                        tx.executeSql('UPDATE Users SET boxCount=boxCount+1 WHERE username=?', [name]);
                    }
                    success("doesn't exist");
                }
            });
        });

    }
}

team21App.service('DbService', DbService);
