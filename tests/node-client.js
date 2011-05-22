var YUI = require("yui3").YUI,
    colors = require("/Users/drg/Code/node/lib/colors.js/colors");
    
YUI({
    filter: "RAW",
    debug: true,
    base: '/Users/drg/Code/yui/yui3/build/',
    modules: {
        'Twitter': {
             fullpath: '/Users/drg/Code/yui-twitter/js/yui-twitter.js',
             requires: ['yql'] /* >= YQL_3.4.0  (<3.4.0 had an HTTPS bug) */
         }
     }
}).use('Twitter', function (Y) {
    
    var twitter = new Y.Twitter({
        oauth_token           : 'YOUR VALUE',
        oauth_token_secret    : 'YOUR VALUE',
        oauth_consumer_key    : 'YOUR VALUE',
        oauth_consumer_secret : 'YOUR VALUE'
    });
    
    /*
    twitter.search("yui", function(tweets){
        Y.each(tweets, function (tweet) {
           time_split = tweet.created_at.split(" ");
           createdAgo = relative_time( Date.parse(time_split[2] + " " + time_split[1] + ", " + time_split[3] + " " + time_split[4]) );
           console.log((tweet.from_user).cyan.bold + ": " + tweet.text + ". " + ("(" + createdAgo + ")").grey);
        });
    }, {count: 2});
    */
    
    twitter.friends_timeline(function(tweets){
        console.dir(tweets);
        Y.each(tweets, function (tweet) {
           time_split = tweet.created_at.split(" ");
           createdAgo = relative_time( Date.parse(time_split[1] + " " + time_split[2] + ", " + time_split[5] + " " + time_split[3]) );
           console.log((tweet.user.screen_name).cyan.bold + ": " + tweet.text + ". " + ("(" + createdAgo + ")").grey);
        });
    }, {count: 50});
    
    function relative_time(parsed_date) {
        var delta, relative_to;

        relative_to = (arguments.length > 1) ? arguments[1] : new Date();
        delta = parseInt((relative_to.getTime() - parsed_date) / 1000, 10) + (relative_to.getTimezoneOffset() * 60);

        if (delta < 60) {
            return 'less than a minute ago';
        } else if (delta < 120) {
            return 'a minute ago';
        } else if (delta < (45 * 60)) {
            return (parseInt((delta / 60), 10)).toString() + ' minutes ago';
        } else if (delta < (90 * 60)) {
            return 'an hour ago';
        } else if (delta < (24 * 60 * 60)) {
            return '' + (parseInt((delta / 3600), 10)).toString() + ' hours ago';
        } else if (delta < (48 * 60 * 60)) {
            return '1 day ago';
        } else {
            return (parseInt((delta / 86400), 10)).toString() + ' days ago';
        }
    }
});