// Helper functions to help keep server.js clean

function processResponse(request, response, callback){
  var body = request.body.Body;
  var from = request.body.From;
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

function createNewWhenRecord(User, When, request, response, callback){
  var parsedDate = request.body.date.split('-');
  var areyouin = request.body.areyouin;
  var msisdn = request.body.msisdn;
  var date = new Date(parsedDate[0],(parsedDate[1]-1),parsedDate[2]);
  User.find({where:{msisdn:msisdn}}).success(function(user){
    if(user == null){
      var err = 'No user with msisdn: '+msisdn;
      callback(err, response);
    }else{
      When.create({date:date, areYouIn:areyouin}).success(function(when){
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
