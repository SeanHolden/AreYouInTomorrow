var client = require('twilio')(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

function sendSmsToAllUsers(User){
  User.findAll().success(function(users){
    for(i in users){
      client.sendSms({
        to:users[i].msisdn,
        from: process.env.TWILIO_PHONE_NO,
        body: 'Hey, '+users[i].firstName+'. Are you in the office this week? http://www.google.com/?token='+users[i].token
      }, function(err, responseData) {
        if(err) { 
          console.log(err);
        }else{
          console.log(responseData);
        };
      });
    };
  }); 
}

module.exports = {
  sendSmsToAllUsers : sendSmsToAllUsers
};
