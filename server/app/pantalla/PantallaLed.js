var util = require('util'),
    EventEmitter = require('events').EventEmitter,
    //logger = require('./Logger'),
    sp = require("serialport");

function PantallaLed() {
    var that = this, environment, initialize, turnOff, startDay, checkControl,
        $AC, setup, setPercent, getLightValues, getTemperatura,
        setMaxPinValuePercent, initReadEvents, temperatura = 0,
        getSettings, getConfig, isCustomized = false, setSettings,
        readTemperature, isStarting = false, isEnding = false,
        emitLightValues,
        j5 = require("johnny-five"),
        moment = require('moment-range'),
        port, board;

//    port = new sp.SerialPort("/dev/ttyACM0", {
//        baudrate: 57600, // No other boud rate works
//        buffersize: 128 // Firmata uses 1
//    });

    board = new j5.Board(/*{
        port: port
    }*/);

    environment = {
        moonLight: null,
        dayLight : null,
        units    : {
            s: 1000, //ms
            m: 60000, //ms
            h: 3600000 //ms
        }
    };

    initialize = function (pantallaLedConfig) {
        getConfig(pantallaLedConfig);
        board.on("ready", function () {
            setup();
            //initReadEvents(that);
            checkControl();
        });
    };

    getConfig = function (pantallaLedConfig) {
        $AC = pantallaLedConfig;
    };

    setup = function () {
        var unit;
        environment.dayLight = new j5.Led($AC.pins.digitals.DAY_LIGHT);
        environment.moonLight = new j5.Led($AC.pins.digitals.MOON_LIGHT);
        environment.highLight = new j5.Led($AC.pins.digitals.HIGH_LIGHT);
        environment.redLight = new j5.Led($AC.pins.digitals.RED_LIGHT);
        //environment.temperature = new j5.Sensor({ pin: $AC.pins.analogs.TEMPERATURE, freq: 5000});

        environment.maxPinValue = parseInt($AC.config.maxPinValuePercent * 255 / 100);

        //override with units
        unit = environment.units[$AC.config.units];
        environment.dawnDuration = $AC.config.dawnDuration * unit;
        environment.sunsetDuration = $AC.config.sunsetDuration * unit;
        environment.moonLightTime = $AC.config.moonLightTime * unit;
    };

    getSettings = function () {
        return $AC.config;
    };

    setSettings = function (settings) {
        $AC.config = settings;
        setup();
    };

    readTemperature = function (scope) {
        readTemperature();
    };

    checkControl = function () {
        var start, end, range;

        setInterval(function () {
            start = moment($AC.config.startTime, $AC.dateFormat);
            end = moment($AC.config.finishTime, $AC.dateFormat);
            range = moment().range(start, end);
            if ((new moment()).format($AC.dateFormat).match($AC.config.startTime)) {
                isCustomized = false;
                if (!isStarting) {
                    isStarting = true;
                    startDay();
                    setTimeout(function () {
                        isStarting = false;
                    }, environment.dawnDuration);
                }
            } else {
                if ((new moment()).format($AC.dateFormat).match($AC.config.finishTime)) {
                    isCustomized = false;
                    if (!isEnding) {
                        turnOff();
                        isEnding = true;
                        setTimeout(function () {
                            isEnding = false;
                        }, environment.sunsetDuration);
                    }
                } else {
                    if (!isStarting && !isEnding && !isCustomized) {
                        if (range.contains(new Date())) {
                            ["dayLight", "moonLight", "highLight", "redLight"].forEach(function (type) {
                                if (!environment[type].value) {
                                    environment[type].brightness(environment.maxPinValue);
                                }
                            });
                        } else {
                            ["dayLight", "highLight", "redLight"].forEach(function (type) {
                                if (environment[type].value) {
                                    environment[type].brightness(0);
                                }
                            });
                        }
                    }
                }
            }
        }, 10000);
    }

    startDay = function () {
        emitLightValues("dawnDuration");

        //moonlight
        environment.moonLight.fade(environment.maxPinValue, environment.dawnDuration / 2);

        //daylight
        setTimeout(function () {
            environment.dayLight.fade(environment.maxPinValue, environment.dawnDuration - environment.dawnDuration / 6);
        }, environment.dawnDuration / 6);

        //highlight
        setTimeout(function () {
            //(setPercent("dayLight"))(1);
            environment.highLight.fade(environment.maxPinValue, environment.dawnDuration - environment.dawnDuration / 4);
        }, environment.dawnDuration / 4);

        //red light
        setTimeout(function () {
            environment.redLight.fade(environment.maxPinValue, environment.dawnDuration - environment.dawnDuration / 8);
        }, environment.dawnDuration / 8);
    }

    turnOff = function () {
        emitLightValues("sunsetDuration");
        //highLight
        environment.highLight.fadeOut(parseInt(environment.sunsetDuration / 2));

        //dayLight
        setTimeout(function () {
            environment.dayLight.fadeOut(parseInt(environment.sunsetDuration - environment.sunsetDuration / 12));
        }, environment.dawnDuration / 12);

        //red light
        setTimeout(function () {
            environment.redLight.fadeOut(parseInt(environment.sunsetDuration - environment.sunsetDuration / 8));
        }, environment.dawnDuration / 8);

        //moonlight
        setTimeout(function () {
            environment.moonLight.fadeOut(environment.sunsetDuration);
        }, environment.moonLightTime);
    }

    emitLightValues = function (intervalType) {
        var infoIntervalId = null;
        setTimeout(function () {
            clearInterval(infoIntervalId);
            that.emit(intervalType.replace("Duration", ""), getLightValues());
        }, environment[intervalType]);

        infoIntervalId = setInterval(function () {
            that.emit(intervalType.replace("Duration", ""), getLightValues());
        }, 2000);
    };

    setPercent = function (lightType) {
        isCustomized = true;
        return function (percent) {
            var value = parseInt(percent * environment.maxPinValue / 100);
            environment[lightType].stop();
            environment[lightType].brightness(value);
        }
    }

    getLightValues = function () {
        return {
            moonLight: environment.moonLight && environment.moonLight.value ? environment.moonLight.value * 100 / environment.maxPinValue : 0,
            highLight: environment.highLight && environment.highLight.value ? environment.highLight.value * 100 / environment.maxPinValue : 0,
            dayLight : environment.dayLight && environment.dayLight.value ? environment.dayLight.value * 100 / environment.maxPinValue : 0,
            redLight : environment.redLight && environment.redLight.value ? environment.redLight.value * 100 / environment.maxPinValue : 0,
            potencia : $AC ? (environment.maxPinValue ? environment.maxPinValue * 100 / 255 : 0) : 0
        }
    }

    setMaxPinValuePercent = function (percent) {
        isCustomized = true;
        environment.maxPinValue = parseInt(percent * 255 / 100);
        ["dayLight", "moonLight", "highLight", "redLight"].forEach(function (type) {
            if (environment[type].value) {
                environment[type].brightness(environment.maxPinValue);
            }
        });
    };

    readTemperature = function () {
        var pin = $AC.pins.digitals.TEMPERATURE;
        board.firmata = board.io;
        board.firmata.sendOneWireConfig(pin, true);
        board.firmata.sendOneWireSearch(pin, function (error, devices) {
            var device, reading;
            if (error) {
                logger.error("Error reading temperature: ", error);
                return;
            }

            // only interested in the first device
            device = devices[0];

            reading = function () {
                // start transmission
                board.firmata.sendOneWireReset(pin);
                // a 1-wire select is done by ConfigurableFirmata
                board.firmata.sendOneWireWrite(pin, device, 0x44);
                // the delay gives the sensor time to do the calculation
                board.firmata.sendOneWireDelay(pin, 3000);
                // start transmission
                board.firmata.sendOneWireReset(pin);
                // tell the sensor we want the result and read it from the scratchpad
                board.firmata.sendOneWireWriteAndRead(pin, device, 0xBE, 9, function (error, data) {
                    var tempTmp, raw;
                    if (error) {
                        console.error(error);
                        return;
                    }
                    raw = (data[1] << 8) | data[0];
                    tempTmp = (raw / 16.0).toFixed(2);
                    if(tempTmp !== temperatura) {
                        temperatura = tempTmp;
                        that.emit("temperaturaChanged", temperatura);
                    }
                });
            };
            // read the temperature now
            reading();
            // and every 1 second
            setInterval(reading, 6000);
        });
    };

    getTemperatura = function () {
        return {"temperatura": temperatura};
    };

    this.init = initialize;
    this.setDayLightPercent = setPercent("dayLight");
    this.setMoonLightPercent = setPercent("moonLight");
    this.setHighLightPercent = setPercent("highLight");
    this.setRedLightPercent = setPercent("redLight");
    this.setMaxPinValuePercent = setMaxPinValuePercent;
    this.getLightValues = getLightValues;
    this.getTemperatura = getTemperatura;
    this.getSettings = getSettings;
    this.setSettings = setSettings;
};

util.inherits(PantallaLed, EventEmitter);
module.exports = PantallaLed;