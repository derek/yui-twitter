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
    
    function where(params) {
        
        if (!params) return '';
        
        var wheres = [];
        Y.each(params, function(value, key, a){
            wheres.push(key + "=" + "'" + value + "'");
        })
        
        return " WHERE " + wheres.join(" AND ");
    }
    
    function normalize(tweets) {
        
        //normalize it as an array if YQL only gives us an object back
        if (!Y.Lang.isArray(tweets)) {
            tweets = [tweets];
        }
        
        return tweets;
    }

// ******* Public
    Twitter.prototype.search = function(searchQuery, callback, params) {
        // Defaults
        params = params || {};
        
        if (params.count) {
            params.rpp = params.count; //rename from 'rpp' to 'count', as most other API methods use that instead.  Silly twitter search.
            delete params.count;
        }
        params.q = searchQuery;
        
        this._execYql('SELECT * FROM twitter.search' + where(params), function(r){
            var tweets = normalize(r.results.results);
            callback(tweets);
        }, params, false);
    }

    Twitter.prototype.friends_timeline = function(callback, params) {
        this._execYql('SELECT * FROM twitter.status.timeline.friends' + where(params), function(r){
            var tweets = normalize(r.results.statuses.status);
            callback(tweets);
        }, params, true);
    }

    Twitter.prototype.user_timeline = function(user, callback, params) {
        params = params || {};
        params.id = user;
        params.since_id = params.since_id || 1;

        this._execYql('SELECT * FROM twitter.status.timeline.user' + where(params), function(r){
            var tweets = normalize(r.results.statuses.status);
            callback(tweets);
        }, params, true);
    }

    Twitter.prototype.user_mentions = function(callback) {
        this._execYql('SELECT * FROM twitter.status.mentions', function(r){
            callback(r.results.statuses.status)
        }, {}, true);
    }

    Twitter.prototype.user_favorites = function(username, callback) {
        this._execYql('SELECT * FROM twitter.favorites WHERE id=@user', function(r){
            callback(r.results.statuses.status)
        }, {user:username}, true);
    }

    Twitter.prototype.user_lists = function(username, callback) {
        this._execYql('SELECT * FROM twitter.lists WHERE user=@user', function(r){
            callback(r.results.lists_list.lists.list);
        }, {user:username}, true);
    }

    Twitter.prototype.user_list_subscriptions = function(username, callback) {
        this._execYql('SELECT * FROM twitter.lists.subscriptions WHERE user=@user', function(r){
            callback(r.results.lists_list.lists.list);
        }, {user:username}, true);
    }

    Twitter.prototype.direct_messages_in = function(callback) {
        this._execYql('SELECT * FROM twitter.directmessages', function(r){
            callback(r.results['direct-messages']['direct_message'])
        }, {}, true);
    }

    Twitter.prototype.direct_messages_out = function(callback) {
        this._execYql('SELECT * FROM twitter.directmessages.sent', function(r){
            callback(r.results['direct-messages']['direct_message'])
        }, {}, true);
    }

    Twitter.prototype.followers = function(username, callback) {
        this._execYql('SELECT * FROM twitter.followers WHERE id = @id', function(r){
            callback(r.results.ids.id)
        }, {id:username}, false);
    }

    Twitter.prototype.following = function(username, callback) {
        this._execYql('SELECT * FROM twitter.friends WHERE id = @id', function(r){
            callback(r.results.ids.id)
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
            callback(r.results.relationship)
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
            callback(r.results.user)
        }, params, false);
    }

    Twitter.prototype.trends = function(callback) {
        
        // Current table is borked
        var altDatatable = 'USE "http://derek.io/~/yql-tables/twitter/twitter.trends.xml" as twitter.trends;';

        this._execYql(altDatatable + 'SELECT * FROM twitter.trends', function(r){
            callback(r.results.trends)
        }, {}, false);
    }

    Twitter.prototype.ratelimit = function(callback) {
        this._execYql('SELECT * FROM twitter.account.ratelimit', function(r){
            callback(r.results.hash)
        }, {}, true);
    }
    
    Twitter.prototype.update_status = function(status, callback) {
        var altDatatable = 'USE "http://derek.io/~/yql-tables/twitter/twitter.status.xml" as post_twitter_status;';
        this._execYql(altDatatable + 'UPDATE post_twitter_status SET status=@status WHERE ' + this._oauth_to_where(), function(r){
            if (callback) callback(r)
        }, {status: status}, false); // 'false' for authentication, because we are including it in the statement itself
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
        
        //console.log(yqlStatement);
        
        new Y.YQL(yqlStatement, function(response){
            if(callback) callback(response.query);
        }, params, {proto: "https"});
    }

    Twitter.prototype._oauth_to_where = function() {
        var where = [];
        for (key in this.oauth) {
            where.push(key + "='" + this.oauth[key] + "'");
        }
        return where.join(" AND ");
    }

    
    Y.Twitter = function(config) {
        return new Twitter(config);
    };

});