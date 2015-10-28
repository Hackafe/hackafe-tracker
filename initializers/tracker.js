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
      deviceGet: function(mac, next) {
        this.devices.find({mac:mac}).limit(1).next(next);
      },
      devicesGet: function(macs, next) {
        api.log('retrieving devices: '+JSON.stringify(macs), 'info');
        this.devices.find({mac: {$in: macs}}).toArray(function(err, devices) {
          if (err) api.log(err+' error retrieving devices', 'error');
          if (devices) api.log('devices: '+devices.length, 'info');
          api.log('devices: '+JSON.stringify(devices), 'debug');
          next(err, devices);
        });
      },
      deviceGetByIp: function(ip, next) {
        this.devices.find({data:{ip: ip}}).limit(1).next(next);
      },
      devicesList: function(next) {
        this.devices.find().toArray(next);
      },
      deviceCreateOrUpdate: function(mac, data, next) {
        api.log('creating device '+mac+': '+data, 'info');
        this.devices.updateOne({mac: mac}, {
            $set: {
                data: data,
                _updated: new Date()
            },
            $setOnInsert: {
                _created: new Date()
            }}, {upsert: true}, function(err, r){
            if (err) {
                api.log(err+' error creating device', 'error');
            }
            api.log(r+' result creating device', 'info');
            if (next) next(err, r);
        });
      },
      // sessions
      sessionRegister: function(mac, start, end, next) {
        api.log('registering session for '+mac+': '+start+' '+end, 'info');
        return this.sessions.updateOne({
          mac: mac,
          end: {$gte: start}
        }, {
          $min: {start: start},
          $max: {end: end}
        }, {
          upsert: true
        }, function(err, r) {
            if (err) {
                api.log(err+' error registering session', 'error');
            }
            api.log(r+' result registering session', 'info');
            if (next) next(err, r);
        });
      },
      sessionsAt: function(time, next) {
        var q = {
          start: {$lte: time},
          end: {$gte: time}
        };
        api.log('time='+time, 'info');
        this.sessions.find(q).toArray(function(err, sessions) {
          if (err) api.log(err+' could not query sessions', 'error');
          if (sessions) api.log('sessions: '+sessions.length, 'info');
          api.log('sessions: '+JSON.stringify(sessions), 'debug');
          next(err, sessions);
        });
      },
      sessionsList: function(mac, next) {if (next) next();},
      sessionDelete: function(mac, sessionId, next) {if (next) next();},
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
    api.tracker.sessions.createIndexes([
      {key: {mac: 1, start: -1}, background: true}
    ]);
  },
  stop: function(api, next){
    next();
  }
};
