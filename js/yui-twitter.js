YUI.add("Twitter", function(Y){
    
    Y.Twitter = function(){};
   
    Y.Twitter.prototype.search = function(query, cb) {
        var yqlQuery = 'SELECT * FROM twitter.search WHERE q = @query';
        _execYql(yqlQuery, function(r){
            cb(r.query.results.results);
        }, {query: query});
    }

    Y.Twitter.prototype.user = {};
    Y.Twitter.prototype.user.timeline = function(user, cb) {
        var yqlQuery = 'select * from twitter.user.timeline WHERE screen_name = @screen_name';
        _execYql(yqlQuery, function(r){
            cb(r.query.results.statuses.status)
        }, {screen_name: user});
    }

    function _execYql(query, cb, params) {
        new Y.YQL(query, function(response){
            cb(response);
        }, params);
    }
    
});