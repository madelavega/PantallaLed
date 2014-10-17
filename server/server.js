/*global require: false, console: false*/
var express = require("express"),
    app = express(),
    server = require("http").createServer(app),
    io = require("socket.io").listen(server),
    path = require("path"),
    Controller,
    events = require("events"),
    pantalla,
    serverConfig = require("./config.json");

server.listen(serverConfig.port);

app.get("/", function (req, res) {
    "use strict";
    res.sendfile(path.resolve(__dirname + "/../client") + "/index.html");
});

app.use(express.static(path.resolve(__dirname + "/../client") + "/"));

Controller = require("./app/Controller").Controller;

//TODO where they must to be?? Investigate the best place for these event handlers
pantalla = Controller.getManagers().pantalla;
pantalla.on("temperatura", function (temp) {
    io.sockets.send(JSON.stringify({"temperatura": temp}));
});

pantalla.on("sunset", function (lightValues) {
    io.sockets.send(JSON.stringify({"sunset": lightValues}));
});

pantalla.on("dawn", function (lightValues) {
    io.sockets.send(JSON.stringify({"dawn": lightValues}));
});

io.sockets.on("connection", function (socket) {
    "use strict";

    socket.on("message", function (message) {
        var data, type, mgrFunction, manager;

        data = JSON.parse(message);
        type = data.type;

        //get the manager and threat the message
        manager = Controller.getManagerByMessage(type);
        //this closure returned is the function of the manager to execute
        mgrFunction = manager.handleMessage(type);
        mgrFunction(data.data).then(function (result) {
            if (result.doBroadCasting) {
                socket.broadcast.send(JSON.stringify(result.data));
            } else {
                socket.send(JSON.stringify(result.data));
            }
        });

    });
});

