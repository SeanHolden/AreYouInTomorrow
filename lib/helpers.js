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

function dateToString(date, callback){
  var year = date.getFullYear();
  var month = ( date.getMonth()+1 );
  var day = ( date.getDate() );
  callback(year + "-" + month + "-" + day + " GMT");
}

// Sorting function.
// Usage example to sort by date: arrayOfHashes.sort( dynamicSort("date") )
function dynamicSort(property) {
  var sortOrder = 1;
  if(property[0] === "-") {
    sortOrder = -1;
    property = property.substr(1);
  }
  return function (a,b) {
    var result = (a[property] < b[property]) ? -1 : (a[property] > b[property]) ? 1 : 0;
    return result * sortOrder;
  }
}

// Finds hash containing info on who is in on one particular date.
// e.g. {date:"2013-08-19",whosin:["sean","barry","dan"]}
function whosInOnThisDay(When, User, dateString, callback){
  var date = new Date(dateString+' GMT');
  When.findAll({where:{date:date},include:[User]}).success(function(whens){
    var responses = [];
    for(var i=0;i<whens.length;i++){
      var user = whens[i].user.dataValues.firstName;
      if(whens[i].dataValues.areYouIn == 'yes'){
        responses.push(user);
      }
    };
    dateString = dateString.replace(' GMT', '')
    dateObject = {date:dateString,whosin:responses};
    callback(dateObject);
  });
}

// Get array of hashes. e.g. [date: "2013-08-19", whosin: {"sean": "yes", "barry": "no"}] ... etc
function getWeekArray(When, User, weekDays, callback){
  var weekArray = [];
  for(var i=0;i<weekDays.length;i++){
    dateToString(weekDays[i], function(weekDayString){
      whosInOnThisDay(When, User, weekDayString, function(objResponse){
        weekArray.push(objResponse);
        if( weekArray.length == ( weekDays.length ) ){
          // weekArray has all days in it so can callback now.
          callback(weekArray);
        };
      });
    });
  };
}

function checkDateValid(date, callback){
  if( date.match(/^\d{4}-\d\d?-\d\d?$/ ) ){
    callback(date);
  }else{
    callback(null);
  };
}

function generateToken(counter,callback){
  var token;
  require('crypto').randomBytes(12, function(ex, buf) {
    var token = buf.toString('hex');
    if(typeof counter == 'undefined'){
      callback(token);
    }else{
      callback(counter, token);
    };
  });
}

function resetTokens(User, callback){
  User.findAll().success(function(users){
    for(i in users){
      generateToken(i, function(i, token){
        users[i].updateAttributes({token:token}).success(function(){
          callback();
        });
      });
    }
  });
}

module.exports = { 
  processResponse : processResponse,
  getTheWeekOf : getTheWeekOf,
  dateToString : dateToString,
  dynamicSort : dynamicSort,
  getWeekArray : getWeekArray,
  whosInOnThisDay : whosInOnThisDay,
  checkDateValid : checkDateValid,
  generateToken : generateToken,
  resetTokens : resetTokens
};


