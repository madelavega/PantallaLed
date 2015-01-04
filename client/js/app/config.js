angular.module("app").config(["$routeProvider",
    function ($routeProvider) {
        $routeProvider.
            when("/iluminacion", {
                templateUrl: "partials/iluminacion.html",
                controller : "IluminacionCtrl"
            }).
            when("/ajustes", {
                templateUrl: "partials/ajustes.html",
                controller : "AjustesCtrl"
            }).
//            when("/temperatura", {
//                templateUrl: "partials/temperatura.html",
//                controller : "TemperaturaCtrl"
//            }).
            otherwise({
                redirectTo: "/ajustes"
            });
    }]);