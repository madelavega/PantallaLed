/*global console: false, angular: false*/
angular.module("app")
    .controller("TemperaturaCtrl", ["$scope", "socketioconnector", function ($scope, connector) {
        "use strict";

        $scope.temperatura = 0;

        if (connector.isReady()) {
            connector.sendMessage("pantalla/getTemperatura");
        } else {
            connector.on("connectionopen", function () {
                connector.sendMessage("pantalla/getTemperatura");
            });
        }

        connector.on("temperatura", function (value) {
            console.log("temperatura: " + value);
            value = (value + "").split(".");
            $scope.temperatura = [value[0], ".", value[1].substring(0,2)].join("");
            $scope.$apply();
        });
    }]);