// Helper functions to help keep server.js clean

function processResponse(body, from, response, callback){
  if( body.trim()[0] == '1' ){
    console.log('Yep, %s will be in tomorrow', from);
  }else if(body.trim()[0] == '2' ){
    console.log('Nope, %s will not be in tomorrow', from);
  }else if(body.trim()[0] == '3' ){
    console.log('Maybe %s will be in tomorrow', from);
  }else{
    console.log('Unrecognised response. Not 1, 2 or 3.');
  };
  callback(response);
}

function createNewWhenRecord(User, When, date, areyouin, msisdn, response, callback){
  var parsedDate = date.split('-');
  var dateWithoutTime = new Date(parsedDate[0],(parsedDate[1]-1),parsedDate[2]);
  User.find({where:{msisdn:msisdn}}).success(function(user){
    if(user == null){
      var err = 'No user with msisdn '+msisdn;
      callback(err, response);
    }else{
      // TODO: figure out how to create a When record with a User association...
      When.create({date:dateWithoutTime, areYouIn:areyouin}).success(function(when){
        user.addWhen(when);
        callback(null, response);
      });
    };
  });
}

module.exports = { 
  processResponse : processResponse,
  createNewWhenRecord : createNewWhenRecord
};
