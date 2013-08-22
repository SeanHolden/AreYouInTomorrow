var request = require('request');

function shortenUrl(longUrl, callback){
  console.log('SHORTENING URL OF -> '+longUrl);
  var url = 'https://api-ssl.bitly.com';
  var path = '/v3/shorten?access_token='+process.env.BITLY_ACCESS_TOKEN+'&longUrl='+longUrl
  request({url:url+path, json:true}, function (error, response, body) {
    console.log('IN FIRST REQUEST FUNCTION');
    if (!error && response.statusCode == 200) {
      console.log('FIRST API CALL TO BITLY WAS SUCCESSFUL');
      var link = body.data.url;
      var edit_link_path = '/v3/user/link_edit'
      var params = '?access_token='+process.env.BITLY_ACCESS_TOKEN+'&link='+link+'&private=true&edit=private';
      request({url:url+edit_link_path+params, json:true}, function (error, response, body) {
        console.log('SECOND API CALL TO BITLY HAPPENING NOW');
        if (!error && response.statusCode == 200) {
          console.log('SECOND API CALL COMPLETE. CALLING BACK.');
          callback(body.data.link_edit.link);
        }else{
          console.log(error);
        };
      });
    }else{
      console.log(error);
    };
  });
}

module.exports = {
  shortenUrl : shortenUrl
};