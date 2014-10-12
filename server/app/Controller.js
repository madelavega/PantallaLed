exports.Controller = (function () {
    var getManagers, managers = {}, managerPathList,
        managerType, path, getManagerByMessage;

    //loading managers from app/config/managers.json
    managerPathList = require("./config/managers.json");
    for (managerType in managerPathList) {
        if (managerPathList.hasOwnProperty(managerType)) {
            path = "./managers/" + managerPathList[managerType];
            //managers must export an object with the same name of the file
            managers[managerType] = new (require(path))();
        }
    }

    getManagerByMessage = function (message) {
        var manager;
        message = message.split("/");

        if (message.length > 1) {
            manager = managers[message[0]];
            if (manager) {
                return manager;
            }
        }
        return null;
    };

    getManagers = function () {
        return managers;
    }

    return {
        getManagerByMessage: getManagerByMessage,
        getManagers: getManagers
    };
})();