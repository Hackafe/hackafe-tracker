var moment = require('moment');

exports.devicesRegister = {
    name: 'devicesRegister',
    description: 'Register active devices in the network based on the arp -a list',
    blockedConnectionTypes: [],
    outputExample: {},
    matchExtensionMimeType: false,
    version: 1.0,
    toDocument: true,
    middleware: [],

    inputs: {
        arplist: {
            required: true,
            formatter: function (param, connection, actionTemplate) {
                // 0                            1                2  3                 4  5   6       7  8    9       10
                // ge-0.aggregation.cooolbox.bg (78.130.204.193) at 00:50:c2:52:d3:78 on vr0 expires in 1199 seconds [ethernet]

                console.log('parsing ', param);

                var list = param.split("\n").map(function (row) {
                    var cols = row.split(" ");

                    if (cols[6] != 'expires') return false;

                    return {
                        hostname: cols[0],
                        ip: cols[1].substr(1, cols[1].length - 2),
                        mac: cols[3],
                        interface: cols[5],
                        expireSec: cols[8],
                        medium: cols[10].substr(1, cols[10].length - 2)
                    }
                }).filter(function (item) {
                    return !!item
                });

                console.log('parsed ', list);

                return list;
            }
        }
    },

    run: function (api, data, next) {
        var now = new Date();

        data.params.arplist.forEach(function (device) {
            api.tracker.deviceCreateOrUpdate(device.mac, device);
            api.tracker.sessionRegister(device.mac, now, moment(now).add(device.expireSec || 45, 'seconds').toDate());
        });

        next();
    }
};

exports.devicesOnline = {
    name: 'devicesOnline',
    description: 'Display list of devices currently online',
    blockedConnectionTypes: [],
    outputExample: {
        devices: [
            {mac: "00-17-31-9B-00-7Е", since: "2012-04-23T18:25:43.511Z", hostname: "strange-ties"},
            {mac: "00-17-31-9B-00-8Е", since: "2014-04-23T18:25:43.511Z", hostname: "ties-strange"}
        ]
    },
    matchExtensionMimeType: false,
    version: 1.0,
    toDocument: true,
    middleware: [],

    inputs: {},

    run: function (api, data, next) {
        api.tracker.sessionsAt(new Date(), function (err, sessions) {
            if (err) return next(err);

            data.response.devices = sessions.map(function (session) {
                return {mac: session.mac, since: session.start};
            });

            var macs = sessions.map(function (session) {
                return session.mac;
            });
            api.tracker.devicesGet(macs, function (err, devices) {
                if (err) return next(err);

                data.response.devices.forEach(function (result) {
                    for (var i = 0, l = devices.length; i < l; i++) {
                        if (devices[i].mac == result.mac) {
                            result.hostname = devices[i].data.hostname;
                            devices.splice(i, 1);
                            break;
                        }
                    }
                });

                next();
            });
        });
    }
};