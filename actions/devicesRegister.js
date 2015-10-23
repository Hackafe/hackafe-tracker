exports.action = {
  name:                   'devicesRegister',
  description:            'Register active devices in the network based on the arp -a list',
  blockedConnectionTypes: [],
  outputExample:          {},
  matchExtensionMimeType: false,
  version:                1.0,
  toDocument:             true,
  middleware:             [],

  inputs: {
    arplist: {
      required: true,
      formatter: function(param, connection, actionTemplate) {
        console.log('parsing ', param);

        var list = param.split("\n").map(function(row){
          var cols = row.split(" ");
          return {
            hostname: cols[0],
            ip: cols[1].substr(1, cols[1].length-2),
            mac: cols[3],
            medium: cols[4],
            interface: cols[5]
          }
        });

        console.log('parsed ', list);

        return list;
      }
    }
  },

  run: function(api, data, next){
    var error = null;


    next(error);
  }
};