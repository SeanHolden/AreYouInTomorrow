// Helper functions to help keep server.js clean

function processResponse(User, When, request, callback){
  var body = request.body.Body;
  var msisdn = request.body.From;
  if( body.trim()[0] == '1' ){
    UserInTomorrow('yes', User, When, msisdn, function(msg){
      callback(msg);
    });
  }else if(body.trim()[0] == '2' ){
    UserInTomorrow('no', User, When, msisdn, function(msg){
      callback(msg);
    });
  }else if(body.trim()[0] == '3' ){
    UserInTomorrow('maybe', User, When, msisdn, function(msg){
      callback(msg);
    });
  }else{
    var msg = JSON.parse('{"Alert":"Unrecognized response. Must reply with 1, 2 or 3."}');
    callback( JSON.stringify(msg) );
  };
}

function UserInTomorrow(areyouin, User, When, msisdn, callback){
  User.find( { where:{ msisdn:msisdn } } ).success(function(user){
    if(user == null){
      var msg = 'No user with msisdn: '+msisdn;
      callback(msg);
    }else{
      var today = new Date();
      var tomorrow = new Date( today.getFullYear(), today.getMonth(), ( today.getDate()+1 ) );
      createOrUpdateRecord(When, user, areyouin, tomorrow, function(msg){
        callback(msg);
      });
    };
  });
}

function createOrUpdateRecord(When, user, areyouin, tomorrow, callback){
  When.find({ where:{ date:tomorrow, UserId: user.id } }).success(function(when){
    if(when){
      when.updateAttributes({areYouIn:areyouin}).success(function(updatedRecord){
        var msg = JSON.parse('{"Thanks" : "Updated attributes for: '+user.values.msisdn+'"}');
        callback(JSON.stringify(msg));
      });
    }else{
      When.create( { date:tomorrow, areYouIn:areyouin, UserId:user.id } ).success(function(when){
        var msg = JSON.parse('{"Thanks" : "Response of: '+areyouin+' has been recorded"}');
        callback(JSON.stringify(msg));
      });
    };
  });
}

function createNewWhenRecord(User, When, request, callback){
  var parsedDate = request.body.date.split('-');
  var areyouin = request.body.areyouin;
  var msisdn = request.body.msisdn;
  var date = new Date(parsedDate[0],(parsedDate[1]-1),parsedDate[2]);
  User.find({where:{msisdn:msisdn}}).success(function(user){
    if(user == null){
      var err = 'No user with msisdn: '+msisdn;
      callback(err);
    }else{
      When.create({date:date, areYouIn:areyouin}).success(function(when){
        user.addWhen(when);
        callback(null);
      });
    };
  });
}

module.exports = { 
  processResponse : processResponse,
  createNewWhenRecord : createNewWhenRecord
};
