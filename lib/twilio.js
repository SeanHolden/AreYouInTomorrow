var client = require('twilio')(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

function sendSmsToAllUsers(User, callback){
  User.findAll().success(function(users){
    for(i in users){
      client.sendSms({
        to:users[i].msisdn,
        from: process.env.TWILIO_PHONE_NO,
        body: 'Hey, '+users[i].firstName+'. Are you in the office this week? '+users[i].shortUrl
      }, 
      function(err, responseData) {
        if(err) { 
          console.log(err);
        };
      });
      if(i == users.length-1){
        callback();
      }
    };
  }); 
}

module.exports = {
  sendSmsToAllUsers : sendSmsToAllUsers
};
