var team21App = angular.module('team21App');


team21App.directive("fileread", [function () {
    return {
        scope: {
            fileread: "="
        },
        link: function (scope, element, attributes) {
            element.bind("change", function (changeEvent) {
                var reader = new FileReader();
                reader.onload = function (loadEvent) {
                    scope.$apply(function () {
                        scope.fileread = loadEvent.target.result;
                    });
                }
                reader.readAsDataURL(changeEvent.target.files[0]);
            });
        }
    }
}]);


function LoginController($uibModal, AccountService) {
    var $ctrl = this;

    // bind to AccountService functions to get automagic updates
    $ctrl.isLoggedIn = AccountService.getIsLoggedIn;
    $ctrl.currentUser = AccountService.getCurrentUser;

    $ctrl.open = function(mode) {
        $uibModal.open({
            templateUrl: 'login/login.modal.html',
            controller: LoginModalController,
            controllerAs: '$ctrl',
            resolve: {
                mode: function() {
                    return mode;
                }
            }
        });
    }

    $ctrl.logout = function() {
        AccountService.logout();
    }
}


function LoginModalController($q, $uibModalInstance, AccountService, DbService, mode) {
    var $ctrl = this;

    $ctrl.mode = mode;

    DbService.query('SELECT name FROM Dorms ORDER BY name', [], 'name')
    .then(function(dorms) {
        $ctrl.dorms = dorms;
        $ctrl.registerDorm = dorms[0];
    }).catch(function(err) {
        console.log(err);
    });

    var validateLoginForm = function() {
        if (typeof($ctrl.loginUsername) === 'undefined' || $ctrl.loginUsername.length == 0) {
            return "Please enter your uniqname.";
        }
        else if (typeof($ctrl.loginPassword) === 'undefined' || $ctrl.loginPassword.length == 0) {
            return "Please enter your password";
        }

        return null;
    }

    var validateRegisterForm = function() {
        var deferred = $q.defer();
 
        if (typeof($ctrl.registerUsername) === 'undefined' || $ctrl.registerUsername.length == 0) {
            deferred.resolve("Please enter your uniqname.");
        }
        else if (typeof($ctrl.registerDisplayName) === 'undefined' || $ctrl.registerDisplayName.length == 0) {
            deferred.resolve("Please enter a display name.");
        }
        else if ($ctrl.registerPassword !== $ctrl.registerConfirmPassword) {
            deferred.resolve("Passwords don't match.");
        }
        else if (typeof($ctrl.registerPassword) === 'undefined' || $ctrl.registerPassword.length < 6) {
            deferred.resolve("Passwords must be at least six characters long.");
        }

        else {
            AccountService.doesUserExist($ctrl.registerUsername)
            .then(function(doesExist) {
                if (doesExist) {
                    deferred.resolve("The uniqname \"" + $ctrl.registerUsername + "\" is already registered.");
                }
                else {
                    // no validation errors
                    deferred.resolve(null);
                }
            });
        }

        return deferred.promise;
    }

    $ctrl.close = function(didLogin) {
        // convenience, so function param doesn't have to be passed
        if (typeof(didLogin) !== 'boolean') {
            didLogin = false;
        }
        $uibModalInstance.dismiss(didLogin);
    }

    $ctrl.login = function() {
        $ctrl.loginErrorMessage = validateLoginForm();
        if ($ctrl.loginErrorMessage == null) {
            AccountService.login($ctrl.loginUsername, $ctrl.loginPassword)
            .then(function(success) {
                console.log("login attempted, success = " + success);
                if (success) {
                    $ctrl.close(success);
                }
                else {
                    $ctrl.loginErrorMessage = "Wrong uniqname or password.";
                }
            });
        }
    }

    $ctrl.register = function() {
        validateRegisterForm()
        .then(function(errorMessage) {
            $ctrl.registerErrorMessage = errorMessage;
            if (errorMessage == null) {
                AccountService.createUser($ctrl.registerUsername, $ctrl.registerPassword, $ctrl.registerDisplayName, $ctrl.registerDorm, $ctrl.registerPic)
                .then(function() {
                    $ctrl.loginUsername = $ctrl.registerUsername;
                    $ctrl.loginPassword = $ctrl.registerPassword;
                    $ctrl.login();
                })
            }
        });
    }

    if ($ctrl.mode == 'profile') {
        $ctrl.currentUser = AccountService.getCurrentUser();

        DbService.query('SELECT * FROM Users WHERE username=?', [$ctrl.currentUser.username])
          .then(function(results) {
              $ctrl.bottleCount = results[0].bottleCount;
              $ctrl.canCount = results[0].canCount;
              $ctrl.boxCount = results[0].boxCount;
          }).catch(function(err) {
            console.log(err);
        });
    }
}


team21App.component('login', {
    templateUrl: 'login/login.template.html',
    controller: LoginController
});
