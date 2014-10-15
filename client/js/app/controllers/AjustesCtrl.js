/*global console: false, angular: false*/
angular.module("app")
    .controller("AjustesCtrl", ["$scope", "socketioconnector", function ($scope, connector) {
        "use strict";

        $scope.cssClasses = {
            isSaved : "unsaved"
        };

        $scope.settings = {
            startTime: "",
            finishTime              : "",
            dawnDuration            : 0,
            sunsetDuration          : 0,
            moonLightTime           : 0
        };

        $scope.reset = function () {
            connector.sendMessage("pantalla/getSettings");
        };

        $scope.save = function () {
            connector.sendMessage("pantalla/setConfig", $scope.settings);
            $scope.cssClasses.isSaved = "saved";
            $scope.apply();
        };

        $scope.onChange = function () {
            $scope.cssClasses.isSaved = "unsaved";
            $scope.apply();
        };

        if (connector.isReady()) {
            connector.sendMessage("pantalla/getSettings");
        } else {
            connector.on("connectionopen", function () {
                connector.sendMessage("pantalla/getSettings");
            });
        }

        connector.on("settings", function (values) {
            $scope.settings = values;
            $scope.$apply();
        });
    }])
;