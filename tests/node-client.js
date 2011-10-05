var YUI    = require("yui3").YUI,
    colors = require("colors"); // For pretties
    
YUI({
    combine: false,
    debug:   false,
    filter:  'raw',
    modules: {
        'gallery-twitter': {
            fullpath: '../js/gallery-twitter.js',
            requires: ['yql', 'derek-oauth-tokens']
         },
        'derek-oauth-tokens': {
            fullpath: 'derek-oauth-tokens.js'
         }
    }
}).use('gallery-twitter', 'substitute', 'gallery-torelativetime', function (Y) {

    var twitter = new Y.Twitter(Y.derekOAuthTokens);
    
    twitter.search("yuilibrary", function(tweets){
        Y.each(tweets, function (tweet) {
            
            var view = {
               user:       tweet.from_user,
               tweet:      tweet.text,
               createdAgo: Y.toRelativeTime(new Date(tweet.created_at))
            };
           
            console.log( Y.substitute("{user}".cyan.bold + ": {tweet} " + "{createdAgo}".grey, view) );
            
        });
    }, {count: 3});
    
    twitter.friends_timeline(function(tweets){
        tweets.reverse();
        Y.each(tweets, function (tweet) {
            
            var view = {
               user:       tweet.user.screen_name,
               tweet:      tweet.text,
               createdAgo: Y.toRelativeTime(new Date(tweet.created_at))
            };
           
            console.log( Y.substitute("{user}".cyan.bold + ": {tweet} " + "{createdAgo}".grey, view) );
            
        });
    }, {count: 50});
    
});