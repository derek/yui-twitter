YUI.add("gallery-twitter", function(Y){
    
    /* Private */
    function whereString(params) {
        
        var wheres = [];
        
        Y.each(params, function(value, key, a){
            // 'q' is the param for the YQL query, so we cannot pass that into the URL.
            if (key === "q") {
                wheres.push(key + "='" + value + "'");
            }
            else {
                wheres.push(key + "=@" + key);   
            }
        });
        
        if (wheres.length > 0) {
            return " WHERE " + wheres.join(" AND ");
        }
        else {
            return '';
        }
        
    }
    
    function normalize(tweets) {
        
        //normalize it as an array if YQL only gives us an object back
        if (typeof tweets === "undefined") {
            tweets = [];
        }
        else if (!Y.Lang.isArray(tweets)) {
            tweets = [tweets];
        }
        
        return tweets;
    }
    
    
    
    
    /* /Private */
    
    function Twitter(){
        Twitter.superclass.constructor.apply(this, arguments);
    };
    
    
    /* Twitter extends Base */
    Y.extend(Twitter, Y.Base, {
        oauth: {
            oauth_token:            false,
            oauth_token_secret:     false,
            oauth_consumer_key:     false,
            oauth_consumer_secret:  false
        },
        
        initializer : function(config) {
            oauth = this.oauth;
            
            if (config.oauth_token && config.oauth_token_secret) {
                oauth.oauth_token           = config.oauth_token;
                oauth.oauth_token_secret    = config.oauth_token_secret;
            }

            if (config.oauth_consumer_key && config.oauth_consumer_secret) {
                oauth.oauth_consumer_key    = config.oauth_consumer_key;
                oauth.oauth_consumer_secret = config.oauth_consumer_secret;
            }
        },
        
        destructor : function() {
            
        },
        
        search: function(searchQuery, callback, where) {
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
        },

        friends_timeline: function(callback, where) {
            this._execYql('SELECT * FROM twitter.status.timeline.friends' + whereString(where), function(r){
                var tweets = normalize(r.results.statuses.status);
                callback(tweets);
            }, where, true);
        },

        user_timeline: function(user, callback, where) {
            where = where || {};
            where.id = user;
            where.since_id = where.since_id || 1;

            this._execYql('SELECT * FROM twitter.status.timeline.user' + whereString(where), function(r){
                var tweets = normalize(r.results.statuses.status);
                callback(tweets);
            }, where, true);
        },

        user_mentions: function(callback, where) {
            where = where || {};
            whereString(where);return false;
            this._execYql('SELECT * FROM twitter.status.mentions' + whereString(where), function(r){
                var tweets = normalize(r.results.statuses.status);
                callback(tweets);
            }, where, true);
        },

        user_favorites: function(username, callback, where) {
            where = where || {};
            where.id = username;

            this._execYql('SELECT * FROM twitter.favorites' + whereString(where), function(r){
                var tweets = normalize(r.results.statuses.status);
                callback(tweets);
            }, where, true);
        },

        user_lists: function(username, callback, where) {
            where = where || {};
            where.user = username;

            this._execYql('SELECT * FROM twitter.lists' + whereString(where), function(r){
                callback(r.results.lists_list.lists.list);
            }, where, true);
        },

        user_list_subscriptions: function(username, callback, where) {
            where = where || {};
            where.user = username;

            this._execYql('SELECT * FROM twitter.lists.subscriptions' + whereString(where), function(r){
                callback(r.results.lists_list.lists.list);
            }, where, true);
        },

        direct_messages_in: function(callback, where) {
            this._execYql('SELECT * FROM twitter.directmessages' + whereString(where), function(r){
                var tweets = normalize(r.results['direct-messages']['direct_message']);
                callback(tweets);
            }, where, true);
        },

        direct_messages_out: function(callback, where) {
            this._execYql('SELECT * FROM twitter.directmessages.sent' + whereString(where), function(r){
                var tweets = normalize(r.results['direct-messages']['direct_message']);
                callback(tweets);
            }, where, true);
        },

        saved_searches: function(callback, where) {
            this._execYql('SELECT * FROM twitter.search.saved' + whereString(where), function(r){
                var searches = normalize(r.results.saved_searches.saved_search);
                callback(searches);
            }, where, true);
        },

        access_token: function(callback, where) {
            this._execYql('SELECT * FROM twitter.oauth.accesstoken' + whereString(where), function(r){
                callback(r.results.result);
            }, where, true);
        },

        request_token: function(callback, where) {
            this._execYql('SELECT * FROM twitter.oauth.requesttoken' + whereString(where), function(r){
                callback(r.results.result);
            }, where, true);
        },

        followers: function(username, callback, where) {
            where = where || {};
            where.id = username;

            this._execYql('SELECT * FROM twitter.followers' + whereString(where), function(r){
                callback(r.results.ids.id);
            }, where, true);
        },

        following: function(username, callback, where) {
            where = where || {};
            where.id = username;

            this._execYql('SELECT * FROM twitter.friends' + whereString(where), function(r){
                callback(r.results.ids.id);
            }, where, true);
        },

        friendship: function(source, target, callback, where) {
            var  where = {},
                 query = false;

            if (Y.Lang.isNumber(+source)) { 
                where.source_id = source; 
            }
            else if (Y.Lang.isString( source)) { 
                where.source_screen_name = source; 
            }

            if (Y.Lang.isNumber(+target)) { 
                where.target_id = target; 
            }
            else if (Y.Lang.isString( target)) { 
                where.target_screen_name = target; 
            }

            this._execYql('SELECT * FROM twitter.friendships' + whereString(where), function(r){
                callback(r.results.relationship);
            }, where, true);
        },

        profile: function(user, callback, where) {
            var  where = {},
                 query = false;

            if (Y.Lang.isNumber(+user)) { 
                where.id = user; 
            }
            else if (Y.Lang.isString(user)) { 
                where.screen_name = user; 
            }

            this._execYql('SELECT * FROM twitter.users' + whereString(where), function(r){
                callback(r.results.user);
            }, where, false);
        },

        trends: function(callback, where) {

            // Current twitter.trends.xml table does not function properly. Patch submitted.  In the meantime...
            var altDatatable = 'USE "https://raw.github.com/derek/yql-tables/aca55389847d80893347bdd8b2bbf165f6cc58ae/twitter/twitter.trends.xml" as twitter.trends;';

            this._execYql(altDatatable + 'SELECT * FROM twitter.trends' + whereString(where), function(r){
                callback(r.results.trends);
            }, {}, false);
        },

        ratelimit: function(callback, where) {
            this._execYql('SELECT * FROM twitter.account.ratelimit' + whereString(where), function(r){
                callback(r.results.hash);
            }, {}, true);
        },

        update_status: function(status, callback) {

            // We need a custom twitter.status.xml table because we are using YQL env variables and INSERT does not support them with parameter binding
            var altDatatable = 'USE "https://github.com/derek/yui-twitter/raw/master/datatables/twitter.status.xml" as post_twitter_status;';

            this._execYql(altDatatable + 'UPDATE post_twitter_status SET status=@status WHERE ' + this._oauth_to_where(), function(r){
                if (callback){ 
                    callback(r)
                }
            }, {status: status}, false); // 'false' for authentication, because we are including it in the statement itself
        },
        
        _execYql: function(query, callback, params, authenticated) {
            var oauth       = this.oauth,
                protocol    = "http",
                set         = [];
            
            // Defaults
            query         = query         || false;
            callback      = callback      || false;
            params        = params        || {};
            authenticated = authenticated || false;
            
            if (authenticated) {
                protocol = "https";
                Y.Object.each(oauth, function(value, key) {
                    set.push("SET " + key + "='" + value + "' ON twitter; ");
                });
            }
            
            set = set.join('');
            
            yqlStatement = set + query;

            new Y.YQL(yqlStatement, function(response){
                if(callback) callback(response.query);
            }, params, {
                proto: protocol
            });
        },

        _oauth_to_where: function() {
            var oauth = this.oauth,
                where = [];
            
            Y.Object.each(oauth, function(value, key) {
                where.push(key + "='" + value + "'");
            });
            
            return where.join(" AND ");
        }    
    }, { /* STATIC */
        
        NAME: 'twitter',
        
        ATTRS: {
            
        }
        
    });
    
    Y.Twitter = Twitter;

}, '0.0.1', {requires:['yql', 'base']});