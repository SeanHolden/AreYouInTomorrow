// Helper functions to help keep server.js clean

function processResponse(User, When, request, response, callback){
  var body = request.body.Body;
  var msisdn = request.body.From;
  if( body.trim()[0] == '1' ){
    console.log('REPLY IS 1 FOR YES');
    UserInTomorrow('yes', User, When, response, msisdn, function(msg, response){
      callback(msg, response);
    });
  }else if(body.trim()[0] == '2' ){
    console.log('REPLY IS 2 FOR NO');
    UserInTomorrow('no', User, When, response, msisdn, function(msg, response){
      callback(msg, response);
    });
  }else if(body.trim()[0] == '3' ){
    console.log('REPLY IS 3 FOR MAYBE');
    UserInTomorrow('maybe', User, When, response, msisdn, function(msg, response){
      callback(msg, response);
    });
  }else{
    console.log('Unrecognised response. Not 1, 2 or 3.');
    var msg = JSON.parse('{"Alert":"Unrecognized response. Must reply with 1, 2 or 3."}');
    callback(JSON.stringify(msg), response);
  };
}

function UserInTomorrow(areyouin, User, When, response, msisdn, callback){
  User.find( { where:{ msisdn:msisdn } } ).success(function(user){
    if(user == null){
      var msg = 'No user with msisdn: '+msisdn;
      callback(msg, response);
    }else{
      var today = new Date();
      var tomorrow = new Date( today.getFullYear(), today.getMonth(), ( today.getDate()+2 ) );
      When.create( { date:tomorrow, areYouIn:areyouin } ).success(function(when){
        user.addWhen(when);
        var msg = JSON.parse('{"Thanks":"Response of: "'+areyouin+'" has been recorded"}');
        callback(JSON.stringify(msg), response);
      });
    };
  });
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
