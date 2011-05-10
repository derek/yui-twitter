YUI.add("Twitter", function(Y){
    
    Y.Twitter = function(){
        // Nuttin yet
    };
   
// ******* Public
    Y.Twitter.prototype.search = function(searchQuery, cb) {
        var yqlQuery = 'SELECT * FROM twitter.search WHERE q = @query';
        _execYql(yqlQuery, function(r){
            cb(r.results.results);
        }, {query: searchQuery});
    }

    Y.Twitter.prototype.user = {};
    Y.Twitter.prototype.user.timeline = function(userName, cb) {
        var yqlQuery = 'SELECT * FROM twitter.user.timeline WHERE screen_name = @screen_name';
        _execYql(yqlQuery, function(r){
            cb(r.results.statuses.status)
        }, {screen_name: userName});
    }
    
    Y.Twitter.prototype.user.mentions = function(userName, cb) {
        /* Temp hack to pull from the public search */
        new Y.Twitter().search("@derek", cb)
    }

// ******* Private
    function _execYql(query, cb, params) {
        new Y.YQL(query, function(response){
            cb(response.query);
        }, params);
    }
    
});