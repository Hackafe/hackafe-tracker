exports.default = {
    mongo: function(api){
        var mongoDetails = {
            enabled: true,
            // Basic configuration options
            url: process.env.MONGO_URL || 'mongodb://localhost:27017/hackafe'
        };

        return mongoDetails;
    }
};

