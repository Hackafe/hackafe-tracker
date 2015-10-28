/**
 * Created by groupsky on 28.10.15.
 */

var arp = require('arp');

module.exports = {
    loadPriority: 1000,
    startPriority: 1000,
    stopPriority: 1000,
    initialize: function (api, next) {
        api.arp = {
            getMAC: function (ipaddress, next) {
                arp.getMAC(ipaddress, function (error, res) {
                    if (error) {
                        return next(error);
                    }
                    return next(null, res);
                });
            }
        };
        next();
    }
};