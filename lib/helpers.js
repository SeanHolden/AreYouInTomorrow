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
      var year = today.getFullYear().toString();
      var month = (today.getMonth() + 1).toString();
      var day = (today.getDate() + 1).toString();
      var tomorrow = new Date( year+'-'+month+'-'+day+' GMT' );
      console.log('TOMORROW');
      console.log(tomorrow);
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

function getTheWeekOf(date, callback){
  var year = date.getFullYear().toString();
  var month = (date.getMonth() + 1).toString();
  var week = [];
  for(var i=1;i<6;i++){
    var dateInMonth = date.getDate() - (date.getDay() - i)
    var weekDay = new Date(''+date.getFullYear()+'-'+(date.getMonth()+1)+'-'+dateInMonth+' GMT');
    week.push(weekDay);
  };
  callback(week);
};


module.exports = { 
  processResponse : processResponse,
  getTheWeekOf : getTheWeekOf
  // createNewWhenRecord : createNewWhenRecord
};
