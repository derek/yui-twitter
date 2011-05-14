YUI.add("Twitter", function(Y){
    
    var Twitter = function(config){
        this.config = config;
    };
    
    
    Twitter.prototype = {
        
    }
    
    // ******* Public
    Twitter.prototype.search = function(searchQuery, cb) {
        
        var yqlQuery = 'SELECT * FROM twitter.search WHERE q = @query';
        this._execYql(yqlQuery, function(r){
            cb(r.results.results);
        }, {query: searchQuery});

        return this;
    }

    Twitter.prototype.friends = function(cb) {

        var yqlQuery = 'SELECT * FROM twitter.status.timeline.friends WHERE oauth_token = @oauth_token AND oauth_token_secret = @oauth_token_secret AND oauth_consumer_key = @oauth_consumer_key AND oauth_consumer_secret = @oauth_consumer_secret';
        this._execYql(yqlQuery, function(r){
            cb(r);
        });

        return this;
    }

    Twitter.prototype.user_timeline = function(userName, cb) {
        
        var yqlQuery = 'SELECT * FROM twitter.user.timeline WHERE screen_name = @screen_name';
        this._execYql(yqlQuery, function(r){
            cb(r.results.statuses.status)
        }, {screen_name: userName});

        return this;
    }

    Twitter.prototype.user_mentions = function(userName, cb) {
        
        // Temp hack to pull from the public search
        this.search("@"+userName, cb);

        return this;
    }

// ******* Private
    Twitter.prototype._execYql = function(query, cb, params) {
        params = Y.mix(params || {}, this.config);
        new Y.YQL(query, function(response){
            cb(response.query);
        }, params, {proto: "https"});
    }

    
    Y.Twitter = function(config) {
        return new Twitter(config);
    };
});