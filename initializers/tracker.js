var extend = require('util')._extend;

module.exports = {
  loadPriority:  1000,
  startPriority: 1000,
  stopPriority:  1000,
  initialize: function(api, next){
    api.tracker = {
      // constants
      separator: '|',
      devicePrefix: 'device',
      sessionPrefix: 'session',
      // devices
      deviceCreate: function(mac, data, next) {
        this.devices.insertOne({
          mac: mac,
          data: data
        }, next);
      },
      deviceGet: function(mac, next) {
        this.devices.find({mac:mac}).limit(1).next(next);
      },
      devicesList: function(next) {
        this.devices.find().toArray(next);
      },
      deviceUpdate: function(mac, data, next) {
        this.devices.updateOne({mac: mac}, {$set: {data: data}}, next);
      },
      deviceDelete: function(mac, next) {
        this.devices.deleteOne({mac:mac}, next);
      },
      deviceCreateOrUpdate: function(mac, data, next) {
        this.devices.updateOne({mac: mac}, {$set: {data: data}}, {upsert: true}, next);
      },
      // sessions
      sessionRegister: function(mac, start, end, next) {
        api.log('registering session for '+mac+': '+start+' '+end);
        return this.sessions.updateOne({
          mac: mac,
          end: {$gte: start}
        }, {
          $min: {start: start},
          $max: {end: end}
        }, {
          upsert: true
        }, next);
      },
      sessionsList: function(mac, next) {if (next) next()},
      sessionDelete: function(mac, sessionId, next) {if (next) next()},
      // helpers
      buildDeviceKey: function(mac) {
        return this.devicePrefix + this.separator + mac;
      }
    };

    next();
  },
  start: function(api, next){
    api.tracker.devices = api.mongo.db.collection('devices');
    api.tracker.sessions = api.mongo.db.collection('sessions');

    api.tracker.devices.createIndexes([{
      key: {mac: 1},
      unique: true
    }], function(err) {
      if (err) {
        api.log(err+' error creating unique index on devices', 'error');
        return next(err);
      }
      next();
    });
  },
  stop: function(api, next){
    next();
  }
};
