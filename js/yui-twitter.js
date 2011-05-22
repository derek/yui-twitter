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
    
    function whereString(params) {
        
        var wheres = [];
        Y.each(params, function(value, key, a){
            wheres.push(key + "=@" + key);
        })
        
        if (wheres.length > 0) {
            return " WHERE " + wheres.join(" AND ");
        }
        else {
            return '';
        }
        
    }
    
    function normalize(tweets) {
        
        //normalize it as an array if YQL only gives us an object back
        if (!Y.Lang.isArray(tweets)) {
            tweets = [tweets];
        }
        
        return tweets;
    }

// ******* Public
    Twitter.prototype.search = function(searchQuery, callback, where) {
        // Defaults
        where = where || {};
        
        if (where.count) {
            where.rpp = where.count; //rename from 'rpp' to 'count', as most other API methods use that instead.  Silly twitter search.
            delete where.count;
        }
        where.q = searchQuery;
        
        this._execYql('SELECT * FROM twitter.search' + whereString(where), function(r){
            var tweets = normalize(r.results.results);
            callback(tweets);
        }, where, false);
    }

    Twitter.prototype.friends_timeline = function(callback, where) {
        this._execYql('SELECT * FROM twitter.status.timeline.friends' + whereString(where), function(r){
            var tweets = normalize(r.results.statuses.status);
            callback(tweets);
        }, where, true);
    }

    Twitter.prototype.user_timeline = function(user, callback, where) {
        where = where || {};
        where.id = user;
        where.since_id = where.since_id || 1;

        this._execYql('SELECT * FROM twitter.status.timeline.user' + whereString(where), function(r){
            var tweets = normalize(r.results.statuses.status);
            callback(tweets);
        }, where, true);
    }

    Twitter.prototype.user_mentions = function(callback, where) {
        where = where || {};
        whereString(where);return false;
        this._execYql('SELECT * FROM twitter.status.mentions' + whereString(where), function(r){
            callback(r.results.statuses.status)
        }, where, true);
    }

    Twitter.prototype.user_favorites = function(username, callback, where) {
        where = where || {};
        where.id = username;
        
        this._execYql('SELECT * FROM twitter.favorites' + whereString(where), function(r){
            callback(r.results.statuses.status)
        }, where, true);
    }

    Twitter.prototype.user_lists = function(username, callback, where) {
        where = where || {};
        where.user = username;
        
        this._execYql('SELECT * FROM twitter.lists' + whereString(where), function(r){
            callback(r.results.lists_list.lists.list);
        }, where, true);
    }

    Twitter.prototype.user_list_subscriptions = function(username, callback, where) {
        where = where || {};
        where.user = username;
        
        this._execYql('SELECT * FROM twitter.lists.subscriptions' + whereString(where), function(r){
            callback(r.results.lists_list.lists.list);
        }, where, true);
    }

    Twitter.prototype.direct_messages_in = function(callback, where) {
        this._execYql('SELECT * FROM twitter.directmessages' + whereString(where), function(r){
            callback(r.results['direct-messages']['direct_message'])
        }, where, true);
    }

    Twitter.prototype.direct_messages_out = function(callback, where) {
        this._execYql('SELECT * FROM twitter.directmessages.sent' + whereString(where), function(r){
            callback(r.results['direct-messages']['direct_message'])
        }, where, true);
    }

    Twitter.prototype.followers = function(username, callback, where) {
        where = where || {};
        where.id = username;
        
        this._execYql('SELECT * FROM twitter.followers' + whereString(where), function(r){
            callback(r.results.ids.id)
        }, where, false);
    }

    Twitter.prototype.following = function(username, callback, where) {
        where = where || {};
        where.id = username;
    
        this._execYql('SELECT * FROM twitter.friends' + whereString(where), function(r){
            callback(r.results.ids.id)
        }, where, false);
    }

    Twitter.prototype.friendship = function(source, target, callback, where) {
        var  where = {},
             query = false;
        
        if (Y.Lang.isNumber(+source)) { where.source_id = source; }
        else if (Y.Lang.isString(source)) { where.source_screen_name = source; }
        if (Y.Lang.isNumber(+target)) { where.target_id = target; }
        else if (Y.Lang.isString(target)) { where.target_screen_name = target; }
        
        this._execYql('SELECT * FROM twitter.friendships' + whereString(where), function(r){
            callback(r.results.relationship)
        }, where, false);
    }

    Twitter.prototype.profile = function(user, callback, where) {
        var  where = {},
             query = false;
        
        if (Y.Lang.isNumber(+user)) { where.id = user; }
        else if (Y.Lang.isString(user)) { where.screen_name = user; }
        
        this._execYql('SELECT * FROM twitter.users' + whereString(where), function(r){
            callback(r.results.user)
        }, where, false);
    }

    Twitter.prototype.trends = function(callback, where) {
        
        // Current table is borked
        var altDatatable = 'USE "http://derek.io/~/yql-tables/twitter/twitter.trends.xml" as twitter.trends;';

        this._execYql(altDatatable + 'SELECT * FROM twitter.trends' + whereString(where), function(r){
            callback(r.results.trends)
        }, {}, false);
    }

    Twitter.prototype.ratelimit = function(callback, where) {
        this._execYql('SELECT * FROM twitter.account.ratelimit' + whereString(where), function(r){
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