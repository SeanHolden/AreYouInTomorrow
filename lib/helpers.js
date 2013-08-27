// Helper functions to help keep server.js clean

function saveWeekForUser(params, When, user, res){
  var weekCommencing = new Date(params.weekcommencing);
  var weekdays = ['monday','tuesday','wednesday','thursday','friday'];

  getTheWeekOf(weekCommencing, function(thisWeek){
    for(i in weekdays){
      dateToString(thisWeek[i], function(date){
        // if monday/tuesday/wednesday etc... has been switched to yes in the view.
        if(params[weekdays[i]]){
          createOrUpdateRecord(When, user, 'yes', date, i, res);
        }else{
          // otherwise it is a no.
          createOrUpdateRecord(When, user, 'no', date, i, res);
        };
      });
    };
  });
}

function createOrUpdateRecord(When, user, areyouin, date, counter, res){
  When.find({ where:{ date: date, UserId: user.id } }).success(function(when){
    if(when){
      when.updateAttributes({areYouIn:areyouin}).success(function(updatedRecord){
        if(counter == 4){
          res.render('success', {layout: 'layouts/layout'});
          res.end();
        };
      });
    }else{
      When.create( { date: date, areYouIn:areyouin, UserId:user.id } ).success(function(when){
        if(counter == 4){
          res.render('success', {layout: 'layouts/layout'});
          res.end();
        };
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
    var weekDay = new Date(''+date.getFullYear()+'-'+(date.getMonth()+1)+'-'+dateInMonth);
    week.push(weekDay);
  };
  callback(week);
};

function dateToString(date, callback){
  var year = date.getFullYear();
  var month = ( date.getMonth()+1 );
  var day = ( date.getDate() );
  callback(year + "-" + month + "-" + day);
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
  var date = dateString+' 00:00:00+00';

  When.findAll({where:{date:date},include:[User]}).success(function(whens){
    var responses = [];
    for(var i=0;i<whens.length;i++){
      var user = whens[i].user.dataValues.firstName;
      if(whens[i].dataValues.areYouIn == 'yes'){
        responses.push(user);
      }
    };
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
    if(counter == null){
      callback(token);
    }else{
      callback(counter, token);
    };
  });
}

function resetTokensAndShortlinks(User, callback){
  var bitly = require('./bitly');

  User.findAll().success(function(users){
    for(i in users){
      generateToken(i, function(i, token){
        bitly.shortenUrl(process.env.ROOT_URL+'/myweek/?token='+token, function(shortUrl){
          users[i].updateAttributes({token:token, shortUrl:shortUrl}).success(function(){
            callback();
          });
        });
      });
    }
  });
}

module.exports = { 
  getTheWeekOf : getTheWeekOf,
  dateToString : dateToString,
  dynamicSort : dynamicSort,
  getWeekArray : getWeekArray,
  whosInOnThisDay : whosInOnThisDay,
  checkDateValid : checkDateValid,
  generateToken : generateToken,
  resetTokensAndShortlinks : resetTokensAndShortlinks,
  saveWeekForUser : saveWeekForUser
};


