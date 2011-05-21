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
        
        // We can't do proper param binding because q (search query) conflicts with q (yql query) in the querystring. :(
        var yqlQuery = 'twitter.search WHERE q = \'' + searchQuery + '\'';
        this._execYql(yqlQuery, function(r){
            if (callback) callback(r.results.results);
        });
        
        return this;
    }

    Twitter.prototype.friends = function(callback) {
        this._execYql('twitter.status.timeline.friends', function(r){
            if (callback) callback(r.results.statuses.status)
        }, {}, true);
        
        return this;
    }

    Twitter.prototype.user_timeline = function(userName, options, callback) {
        
        options = options || {};
        
        var since_id = options.since_id || 1;

        this._execYql('twitter.user.timeline', function(r){
            if (callback) callback(r.results.statuses.status)
        }, {screen_name: userName, since_id: since_id});
        
        return this;
    }

    Twitter.prototype.user_mentions = function(callback) {
        this._execYql('twitter.status.mentions', function(r){
            if (callback) callback(r.results.statuses.status)
        }, {}, true);
        
        return this;
    }

    Twitter.prototype.user_favorites = function(callback) {
        this._execYql('twitter.favorites', function(r){
            if (callback) callback(r.results) // TODO: Fix path
        }, {}, true);
        
        return this;
    }

    Twitter.prototype.user_lists = function(username, callback) {
        this._execYql('twitter.lists', function(r){
            if (callback) callback(r.results.lists_list.lists.list);
        }, {user:username}, true);
        
        return this;
    }

    Twitter.prototype.user_list_subscriptions = function(username, callback) {
        this._execYql('twitter.lists.subscriptions', function(r){
            if (callback) callback(r.results.lists_list.lists.list);
        }, {user:username}, true);
        
        return this;
    }

    Twitter.prototype.direct_messages_in = function(callback) {
        this._execYql('twitter.directmessages', function(r){
            if (callback) callback(r.results['direct-messages']['direct_message'])
        }, {}, true);
        
        return this;
    }

    Twitter.prototype.direct_messages_out = function(callback) {
        this._execYql('twitter.directmessages.sent', function(r){
            if (callback) callback(r.results['direct-messages']['direct_message'])
        }, {}, true);
        
        return this;
    }

    Twitter.prototype.followers = function(username, callback) {
        this._execYql('twitter.followers', function(r){
            if (callback) callback(r.results.ids.id)
        }, {id:username}, false);
        
        return this;
    }

    Twitter.prototype.friendship = function(source, target, callback) {
        var  params = {},
             isNumber = Y.Lang.isNumber,
             isString = Y.Lang.isString;
        
        if (isNumber(source)) { params.source_id = source; }
        if (isString(source)) { params.source_screen_name = source; }
        if (isNumber(target)) { params.target_id = target; }
        if (isString(target)) { params.target_screen_name = target; }
        
        this._execYql('twitter.friendships', function(r){
            if (callback) callback(r.results.relationship)
        }, params, false);
        
        return this;
    }


// ******* Private
    Twitter.prototype._execYql = function(datatable, callback, params, authenticated) {
        
        // Defaults
        datatable     = datatable     || false;
        callback      = callback      || false;
        params        = params        || {};
        authenticated = authenticated || false;
        
        // Construct the WHERE portion of the query
        var where = [];
        
        if (authenticated) {
            params = Y.mix(params, this.oauth);
        }
        
        for(key in params) {
            where.push(key + " = @" + key)
        }
        
        if (where.length) {
            where = " WHERE " + where.join(" AND ");
        }
        
        query = "SELECT * FROM " + datatable + where;
        
        //Y.log(query);
        
        new Y.YQL(query, function(response){
            if(callback) callback(response.query);
        }, params, {proto: "https"});
    }
    
    Y.Twitter = function(config) {
        return new Twitter(config);
    };


});