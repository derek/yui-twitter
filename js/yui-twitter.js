YUI.add("Twitter", function(Y){
    
    var Twitter = function(config){
        config = config || false;
        
        var oauth = false;

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


// ******* Public
    Twitter.prototype.search = function(searchQuery, callback) {
        var yqlQuery = 'SELECT * FROM twitter.search WHERE q=@searchQuery';
        this._execYql(yqlQuery, function(r){
            if (callback) callback(r.results.results);
        }, {searchQuery: searchQuery});
    }

    Twitter.prototype.friends = function(callback) {
        this._execYql('SELECT * FROM twitter.status.timeline.friends', function(r){
            if (callback) callback(r.results.statuses.status)
        }, {}, true);
    }

    Twitter.prototype.user_timeline = function(userName, options, callback) {
        
        options = options || {};
        
        var since_id = options.since_id || 1;

        this._execYql('SELECT * FROM twitter.user.timeline WHERE screen_name = @screen_name', function(r){
            if (callback) callback(r.results.statuses.status)
        }, {screen_name: userName, since_id: since_id}, true);
    }

    Twitter.prototype.user_mentions = function(callback) {
        this._execYql('SELECT * FROM twitter.status.mentions', function(r){
            if (callback) callback(r.results.statuses.status)
        }, {}, true);
    }

    Twitter.prototype.user_favorites = function(username, callback) {
        this._execYql('SELECT * FROM twitter.favorites WHERE id=@user', function(r){
            if (callback) callback(r.results.statuses.status)
        }, {user:username}, true);
    }

    Twitter.prototype.user_lists = function(username, callback) {
        this._execYql('SELECT * FROM twitter.lists WHERE user=@user', function(r){
            if (callback) callback(r.results.lists_list.lists.list);
        }, {user:username}, true);
    }

    Twitter.prototype.user_list_subscriptions = function(username, callback) {
        this._execYql('SELECT * FROM twitter.lists.subscriptions WHERE user=@user', function(r){
            if (callback) callback(r.results.lists_list.lists.list);
        }, {user:username}, true);
    }

    Twitter.prototype.direct_messages_in = function(callback) {
        this._execYql('SELECT * FROM twitter.directmessages', function(r){
            if (callback) callback(r.results['direct-messages']['direct_message'])
        }, {}, true);
    }

    Twitter.prototype.direct_messages_out = function(callback) {
        this._execYql('SELECT * FROM twitter.directmessages.sent', function(r){
            if (callback) callback(r.results['direct-messages']['direct_message'])
        }, {}, true);
    }

    Twitter.prototype.followers = function(username, callback) {
        this._execYql('SELECT * FROM twitter.followers WHERE id = @id', function(r){
            if (callback) callback(r.results.ids.id)
        }, {id:username}, false);
    }

    Twitter.prototype.friendship = function(source, target, callback) {
        var  params   = {},
             query    = false,
             where    = [];
        
        if (Y.Lang.isNumber(+source)) { params.source_id = source; }
        else if (Y.Lang.isString(source)) { params.source_screen_name = source; }
        if (Y.Lang.isNumber(+target)) { params.target_id = target; }
        else if (Y.Lang.isString(target)) { params.target_screen_name = target; }
        
        query = 'SELECT * FROM twitter.friendships WHERE ';
        for (key in params) { where.push(key + " = @" + key); }
        query += where.join(" AND ");
        
        this._execYql(query, function(r){
            if (callback) callback(r.results.relationship)
        }, params, false);
    }

    Twitter.prototype.profile = function(user, callback) {
        var  params   = {},
             query    = false,
             where    = [];
        
        if (Y.Lang.isNumber(+user)) { params.id = user; }
        else if (Y.Lang.isString(user)) { params.screen_name = user; }
        
        query = 'SELECT * FROM twitter.users WHERE ';
        for (key in params) { where.push(key + " = @" + key); }
        query += where.join(" AND ");
        
        this._execYql(query, function(r){
            if (callback) callback(r.results.user)
        }, params, false);
    }

    Twitter.prototype.trends = function(callback) {
        
        // Current table is borked
        var altDatatable = 'USE "http://derek.io/~/yql-tables/twitter/twitter.trends.xml" as twitter.trends;';

        this._execYql(altDatatable + 'SELECT * FROM twitter.trends', function(r){
            if (callback) callback(r.results.trends)
        }, {}, false);
    }

    Twitter.prototype.ratelimit = function(callback) {
        this._execYql('SELECT * FROM twitter.account.ratelimit', function(r){
            if (callback) callback(r.results.hash)
        }, {}, true);
    }


// ******* Private
    Twitter.prototype._execYql = function(query, callback, params, authenticated) {
        
        // Defaults
        query         = query         || false;
        callback      = callback      || false;
        params        = params        || {};
        authenticated = authenticated || false;
        
        // 
        var set = [];
        if (authenticated) {
            for (key in this.oauth) {
                set.push("SET " + key + "='" + this.oauth[key] + "' ON twitter; ");
            }
        }    
        set = set.join('');
        
        yqlStatement = set + query;
        
        //Y.log(yqlStatement);
        
        new Y.YQL(yqlStatement, function(response){
            if(callback) callback(response.query);
        }, params, {proto: "https"});
    }
    
    Y.Twitter = function(config) {
        return new Twitter(config);
    };

});