var YUI = require("yui3").YUI,
    colors = require("/Users/drg/Code/node/lib/colors.js/colors");

YUI({
    combine: false,
    debug:   true,
    filter:  "raw",
    modules: {
        'gellery-twitter': {
            fullpath: '../js/yui-twitter.js',
            requires: ['yql'] /* >= YQL_3.4.0  (<3.4.0 had an HTTPS bug) */
         }
    }
}).use('gellery-twitter', "substitute", function (Y) {

    var twitter = new Y.Twitter({
        oauth_token           : 'YOUR VALUE',
        oauth_token_secret    : 'YOUR VALUE',
        oauth_consumer_key    : 'YOUR VALUE',
        oauth_consumer_secret : 'YOUR VALUE'
    });
    
    twitter.search("yuilibrary", function(tweets){
        Y.each(tweets, function (tweet) {
            
           var view = {
               user:       (tweet.from_user),
               tweet:      tweet.text,
               createdAgo: function(){
                   var time_split = tweet.created_at.split(" ");
                   var createdAgo = relative_time( Date.parse(time_split[2] + " " + time_split[1] + ", " + time_split[3] + " " + time_split[4]) );
                   
                   return ("(" + createdAgo + ")");
               }
           };
           
           console.log( Y.mustache("{{user}}".cyan.bold + ": {{tweet}} " + "{{createdAgo}}".grey, view) );
           
        });
    }, {count: 50});
    
    twitter.friends_timeline(function(tweets){
        tweets.reverse();
        Y.each(tweets, function (tweet) {
           var view = {
               user:       (tweet.user.screen_name),
               tweet:      tweet.text,
               createdAgo: function(){
                   var time_split = tweet.created_at.split(" ");
                   var createdAgo = relative_time( Date.parse(time_split[1] + " " + time_split[2] + ", " + time_split[5] + " " + time_split[3]) );
                   
                   return ("(" + createdAgo + ")");
               }
           };
           
           console.log( Y.mustache("{{user}}".cyan.bold + ": {{tweet}} " + "{{createdAgo}}".grey, view) );
        });
    }, {count: 2});
    
    
    
    
    
    
    
    function relative_time(parsed_date, relative_to) {
        relative_to = relative_to || new Date();
        
        var seconds = parseInt((relative_to.getTime() - parsed_date) / 1000, 10) + (relative_to.getTimezoneOffset() * 60);

        if      (seconds < 60)             return 'less than a minute ago';
        else if (seconds < 120)            return 'a minute ago';
        else if (seconds < (45 * 60))      return (parseInt((seconds / 60), 10)).toString() + ' minutes ago';
        else if (seconds < (90 * 60))      return 'an hour ago';
        else if (seconds < (24 * 60 * 60)) return '' + (parseInt((seconds / 3600), 10)).toString() + ' hours ago';
        else if (seconds < (48 * 60 * 60)) return '1 day ago';
        else                               return (parseInt((seconds / 86400), 10)).toString() + ' days ago';
    }
    
    // Yes, this is ugly, but it's needed because Mustache.js assumes you are running the browser. Will figure out a better way later
    var oldlog = console.log;
    console.log = function(str){
        oldlog(str.replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;/g, "'"));
    }
});