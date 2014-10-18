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

        ["dayLight", "moonLight", "highLight", "redLight"].forEach(function (type) {
            connector.on(type, function (value) {
                console.log(type, "value", value);
                $scope.lights.filter(function (light) {
                    return light.type === type;
                })[0].value = value;

                $scope.$apply();
            });
        });

        ["sunset", "dawn"].forEach(function (type) {
            connector.on(type, function (lightValues) {
                $scope.lights.forEach(function (light) {
                    light.value = lightValues[light.type];
                });
                $scope.$apply();
            });
        });

        connector.on("potencia", function (value) {
            $scope.potencia = value;
            $scope.$apply();
        });

    }]);