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
        // 0                            1                2  3                 4  5   6       7  8    9       10
        // ge-0.aggregation.cooolbox.bg (78.130.204.193) at 00:50:c2:52:d3:78 on vr0 expires in 1199 seconds [ethernet]

        console.log('parsing ', param);

        var list = param.split("\n").map(function(row){
          var cols = row.split(" ");

          if (cols[6] != 'expires') return false;

          return {
            hostname: cols[0],
            ip: cols[1].substr(1, cols[1].length-2),
            mac: cols[3],
            interface: cols[5],
            expireSec: cols[8],
            medium: cols[10].substr(1, cols[10].length-2)
          }
        }).filter(function(item){
            return !!item
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