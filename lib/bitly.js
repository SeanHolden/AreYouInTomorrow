var request = require('request');

function shortenUrl(longUrl, callback){
  var url = 'https://api-ssl.bitly.com';
  var path = '/v3/shorten?access_token='+process.env.BITLY_ACCESS_TOKEN+'&longUrl='+longUrl
  request({url:url+path, json:true}, function (error, response, body) {
    if (!error && response.statusCode == 200) {
      var link = body.data.url;
      var edit_link_path = '/v3/user/link_edit'
      var params = '?access_token='+process.env.BITLY_ACCESS_TOKEN+'&link='+link+'&private=true&edit=private';
      request({url:url+edit_link_path+params, json:true}, function (error, response, body) {
        if (!error && response.statusCode == 200) {
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