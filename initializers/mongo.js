var mongoPackage = require('mongodb');

module.exports = {
    loadPriority: 100,
    startPriority: 500,
    stopPriority: 1000,
    initialize: function (api, next) {
        api.mongo = {
            client: mongoPackage.MongoClient
        };

        next();
    },
    start: function (api, next) {
        var config = api.config.mongo;

        var url = config.url || 'mongodb://' + config.user + ":" + config.pass + "@" + config.host + ':' + config.port + '/' + config.db;

        api.mongo.client.connect(url, function (err, db) {
            if (err) {
                api.log(err + "error in mongoDB connection", "error");
                return next(err);
            }

            api.log("mongoDB connection ok ", "notice");
            api.mongo.db = db;

            next();
        });
    },
    stop: function (api, next) {
        api.mongo.db.close(function (err, r) {
            if (err) {
                api.log(err + "error closing mongoDb connection", "error");
                return next(err);
            }
            next();
        });
    }
};
