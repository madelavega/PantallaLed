/*global console: false, angular: false*/
angular.module("app")
    .controller("AjustesCtrl", ["$scope", "socketioconnector", function ($scope, connector) {
        "use strict";

        $scope.cssClasses = {
            isSaved: "unsaved"
        };

        $scope.defaults = {
            timeMeasureTypes: [
                { text: "Horas", value: "h"},
                { text: "Minutos", value: "m"},
                { text: "Segundos", value: "s"}
            ]
    };

$scope.settings = {
    startTime         : "",
    finishTime        : "",
    dawnDuration      : 0,
    sunsetDuration    : 0,
    moonLightTime     : 0,
    maxPinValuePercent: 0,
    units             : "m"
};

$scope.reset = function () {
    connector.sendMessage("pantalla/getSettings");
};

$scope.save = function () {
    connector.sendMessage("pantalla/setConfig", $scope.settings);
    $scope.cssClasses.isSaved = "saved";
};

$scope.onChange = function () {
    $scope.cssClasses.isSaved = "unsaved";
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