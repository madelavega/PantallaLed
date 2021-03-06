var util = require('util'),
    Q = require('q'),
    CONFIG_PATH = "./../config/pantallaLed.json",
    BaseMgr = require('./BaseMgr'),
    pantallaLedConfig = require(CONFIG_PATH),
    pantallaLed = new (require("./../pantalla/PantallaLed"))(),
    fs = require('fs');

function PantallaMgr() {
    "use strict";

    var that = this, onTemperatureChanged, onDawn, onSunset;
    pantallaLed.init(pantallaLedConfig);

    PantallaMgr.super_.call(this);

    onTemperatureChanged = function (value) {
        that.emit("temperatura", value);
    };

    onDawn = function (lightValues) {
        that.emit("dawn", lightValues);
    };

    onSunset = function (lightValues) {
        that.emit("sunset", lightValues);
    };

    pantallaLed.on("temperaturaChanged", onTemperatureChanged);
    pantallaLed.on("dawn", onDawn);
    pantallaLed.on("sunset", onSunset);

    this.customizeLight = function (data) {
        var result = {} , actions = {
            moonLight: "setMoonLightPercent",
            highLight: "setHighLightPercent",
            dayLight : "setDayLightPercent",
            redLight : "setRedLightPercent"
        };
        pantallaLed[actions[data.lightType]](data.value);
        result[data.lightType] = data.value;
        return result;
    };

    this.customizePotenciaGeneral = function (data) {
        var result = {};
        pantallaLed.setMaxPinValuePercent(data.value);
        result.potencia = data.value;
        return result;
    };

    this.getLightValues = function () {
        return pantallaLed.getLightValues();
    };

    this.getSettings = function () {
        return { settings: pantallaLed.getSettings()};
    };

    this.getTemperatura = function () {
        return pantallaLed.getTemperatura();
    };

    this.setConfig = function (values) {
        var prop, config = pantallaLedConfig.config,
            d = Q.defer();
        for(prop in values) {
            if(values.hasOwnProperty(prop)) {
                config[prop] = values[prop];
            }
        }

        fs.writeFile(__dirname + "/../config/pantallaLed.json", JSON.stringify(pantallaLedConfig, null, "\t"), function(err) {
            if(err) {
                console.log(err);
            } else {
                pantallaLed.setSettings(pantallaLedConfig.config);
                d.resolve({settings: pantallaLed.getSettings()});
            }
        });


        return d.promise;
    };

    //contains the functions allowed and if they will do a broadcasting. All the functions declared in fn property
    //will be promises
    this.messages = {
        customizeLight          : { fn: this.customizeLight, doBroadCasting: true, promise: false},
        customizePotenciaGeneral: { fn: this.customizePotenciaGeneral, doBroadCasting: true, promise: false},
        getLightValues          : { fn: this.getLightValues, doBroadCasting: false, promise: false},
        getSettings             : { fn: this.getSettings, doBroadCasting: false, promise: false},
        getTemperatura          : { fn: this.getTemperatura, doBroadCasting: false, promise: false},
        setConfig               : { fn: this.setConfig, doBroadCasting: true, promise: true}
    };
};

util.inherits(PantallaMgr, BaseMgr);

module.exports = PantallaMgr;

