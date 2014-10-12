/*global console: false, angular: false*/
angular.module("app")
    .controller("IluminacionCtrl", ["$scope", "socketioconnector", function ($scope, connector) {
        "use strict";

        $scope.floor = 0;
        $scope.ceiling = 100;
        $scope.potencia = 1;
        $scope.lights = [
            {type: "moonLight", value: 0},
            {type: "redLight", value: 0},
            {type: "dayLight", value: 0},
            {type: "highLight", value: 0}
        ];

        $scope.change = function (type, value) {
            //console.log("value for", type, "is", value);
            connector.sendMessage("pantalla/customizeLight", {value: value, lightType: type});
        };

        $scope.changePotenciaGeneral = function () {
            connector.sendMessage("pantalla/customizePotenciaGeneral", {value: $scope.potencia});
        };


        if (connector.isReady()) {
            connector.sendMessage("pantalla/getLightValues");
        } else {
            connector.on("connectionopen", function () {
                connector.sendMessage("pantalla/getLightValues");
            });
        }

        connector.on("moonLight", function (value) {
            console.log("moonLight value", value);
            $scope.lights[0].value = value;
            $scope.$apply();
        });
        connector.on("redLight", function (value) {
            console.log("redLight value", value);
            $scope.lights[1].value = value;
            $scope.$apply();
        });
        connector.on("dayLight", function (value) {
            console.log("dayLight value", value);
            $scope.lights[2].value = value;
            $scope.$apply();
        });
        connector.on("highLight", function (value) {
            console.log("highLight value", value);
            $scope.lights[3].value = value;
            $scope.$apply();
        });
        connector.on("potencia", function (value) {
            console.log("Potencia value", value);
            $scope.potencia = value;
            $scope.$apply();
        });
    }]);