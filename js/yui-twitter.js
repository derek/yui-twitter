YUI.add("Twitter", function(Y){
    
    var Twitter = function(config){
        var config = config || false,
            oauth = false;

        if (config.oauth_token && config.oauth_token_secret && config.oauth_consumer_key && config.oauth_consumer_secret) {
            oauth = {
                oauth_token           : config.oauth_token,
                oauth_token_secret    : config.oauth_token_secret,
                oauth_consumer_key    : config.oauth_consumer_key,
                oauth_consumer_secret : config.oauth_consumer_secret
            };
        }
        
        this.oauth = oauth;
    };

    Twitter.prototype = {
        
    }

// ******* Public
    Twitter.prototype.search = function(searchQuery, callback) {
        var yqlQuery = 'SELECT * FROM twitter.search WHERE q = @query';
        this._execYql(yqlQuery, function(r){
            if (callback) callback(r.results.results);
        }, {query: searchQuery});

        return this;
    }

    Twitter.prototype.friends = function(callback) {

        var yqlQuery = 'SELECT * FROM twitter.status.timeline.friends WHERE oauth_token = @oauth_token AND oauth_token_secret = @oauth_token_secret AND oauth_consumer_key = @oauth_consumer_key AND oauth_consumer_secret = @oauth_consumer_secret';
        this._execYql(yqlQuery, function(r){
            if (callback) callback(r);
        }, {}, true);

        return this;
    }

    Twitter.prototype.user_timeline = function(userName, callback) {
        
        var yqlQuery = 'SELECT * FROM twitter.user.timeline WHERE screen_name = @screen_name';
        this._execYql(yqlQuery, function(r){
            if (callback) callback(r.results.statuses.status)
        }, {screen_name: userName});

        return this;
    }

    Twitter.prototype.user_mentions = function(userName, callback) {
        
        // Temp hack to pull from the public search
        this.search("@"+userName, callback);

        return this;
    }

    Twitter.prototype.user_favorites = function(callback) {
        
        var yqlQuery = 'SELECT * FROM twitter.favorites WHERE oauth_token = @oauth_token AND oauth_token_secret = @oauth_token_secret AND oauth_consumer_key = @oauth_consumer_key AND oauth_consumer_secret = @oauth_consumer_secret';
        this._execYql(yqlQuery, function(r){
            if (callback) callback(r.results) // TODO: Fix path
        }, {}, true);

        return this;
    }

    Twitter.prototype.user_lists = function(username, callback) {
        
        var yqlQuery = 'SELECT * FROM twitter.lists WHERE user = @user AND oauth_token = @oauth_token AND oauth_token_secret = @oauth_token_secret AND oauth_consumer_key = @oauth_consumer_key AND oauth_consumer_secret = @oauth_consumer_secret';
        this._execYql(yqlQuery, function(r){
            if (callback) callback(r.results) // TODO: Fix path
        }, {user:username}, true);

        return this;
    }

    Twitter.prototype.user_list_subscriptions = function(username, callback) {
        
        var yqlQuery = 'SELECT * FROM twitter.lists.subscriptions WHERE user = @user AND oauth_token = @oauth_token AND oauth_token_secret = @oauth_token_secret AND oauth_consumer_key = @oauth_consumer_key AND oauth_consumer_secret = @oauth_consumer_secret';
        this._execYql(yqlQuery, function(r){
            if (callback) callback(r.results) // TODO: Fix path
        }, {user:username}, true);

        return this;
    }

    Twitter.prototype.direct_messages_in = function(callback) {
        
        var yqlQuery = 'SELECT * FROM twitter.directmessages WHERE oauth_token = @oauth_token AND oauth_token_secret = @oauth_token_secret AND oauth_consumer_key = @oauth_consumer_key AND oauth_consumer_secret = @oauth_consumer_secret';
        this._execYql(yqlQuery, function(r){
            if (callback) callback(r.results) // TODO: Fix path
        }, {}, true);

        return this;
    }

    Twitter.prototype.direct_messages_out = function(callback) {
        
        var yqlQuery = 'SELECT * FROM twitter.directmessages.sent WHERE oauth_token = @oauth_token AND oauth_token_secret = @oauth_token_secret AND oauth_consumer_key = @oauth_consumer_key AND oauth_consumer_secret = @oauth_consumer_secret';
        this._execYql(yqlQuery, function(r){
            if (callback) callback(r.results) // TODO: Fix path
        }, {}, true);

        return this;
    }

// ******* Private
    Twitter.prototype._execYql = function(query, callback, params, authenticated) {
        var query         = query         || false,
            callback      = callback      || function(){},
            params        = params        || {},
            authenticated = authenticated || false;
        
        if (!query) {
            throw "Invalid YQL query";
        }
        
        if (authenticated) {
            params = Y.mix(params, this.oauth);
        }        
        
        new Y.YQL(query, function(response){
            callback(response.query);
        }, params, {proto: "https"});
        
    }

    
    Y.Twitter = function(config) {
        return new Twitter(config);
    };
});