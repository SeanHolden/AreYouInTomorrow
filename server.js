// TODO:
// * Create a front end way of allowing users to register their name and mobile number

var express = require('express');
var expressLayouts = require('express-ejs-layouts');
var sequelize = require('./config/database').setup();
var helpers = require('./lib/helpers');
var bitly = require('./lib/bitly');
var twilio = require('./lib/twilio');
var app = express();

// App configuration options
require('./config/app_config').configure( app, express, expressLayouts );

// Define models
var User = sequelize.import(__dirname + "/models/user");
var When = sequelize.import(__dirname + "/models/when");
User.hasMany(When);
When.belongsTo(User);

// Routes
app.get('/', function(req, res){
  res.setHeader('Content-Type', 'text/html');
  var dateFormat = require('dateformat');
  var today = new Date();
  helpers.getTheWeekOf(today, function(week){
    res.render('index', {
      layout:'layouts/layout',
      locals:{thisMonday: dateFormat(week[0], "mmmm dS, yyyy")}
    });
    res.end();
  });
});

// Input page for whether user is in or not. Requires token param for any data to be saved.
app.get('/myweek', function(req, res){
  res.setHeader('Content-Type', 'text/html');
  var dateFormat = require('dateformat');
  var today = new Date();
  helpers.getTheWeekOf(today, function(week){
    res.render('myweek', {
      layout:'layouts/layout',
      locals:{thisMonday: dateFormat(week[0], "mmmm dS, yyyy"),
              weekCommencing: week[0]}
    });
  });
});

// Endpoint to save data on what days a particular user will be in on a particular week.
app.post('/myweek', function(req, res){
  var token = req.body.token;

  User.find({where:{token:token}}).success(function(user){
    if(user){
      helpers.saveWeekForUser(req.body, When, user, res);
    }else{
      res.end('Oops. No user found under this token. This might be an old link from a previous week.');
    };
  });
});

// API call to get list of users who are in the office this week.
app.get('/api/whosinthisweek', function(req ,res){
  res.setHeader('Content-Type', 'application/json');
  var d = new Date();
  var queryDate = req.query.date || d.getFullYear()+'-'+(d.getMonth()+1)+'-'+d.getDate();

  helpers.checkDateValid(queryDate, function(validDate){
    if(validDate){
      var date = new Date(validDate);
      helpers.getTheWeekOf(date, function(weekDays){
        helpers.getWeekArray(When, User, weekDays, function(weekArray){
          var sortedWeek = weekArray.sort( helpers.dynamicSort("date") );
          res.end( JSON.stringify(sortedWeek) );
        });
      });
    }else{
      res.end('{"Error": "Date invalid. Please use the following format: yyyy-mm-dd"}');
    };
  });
});

// API call to create a new user. Requires firstname and msisdn as params.
app.post('/api/create-user', function(req, res){
  var firstname = req.body.firstname;
  var lastname = req.body.lastname;
  var msisdn = req.body.msisdn;
  helpers.generateToken(null, function(token){
    bitly.shortenUrl(process.env.ROOT_URL+'/myweek/?token='+token, function(shortUrl){
      User.create({ firstName: firstname, lastName: lastname, msisdn: msisdn, token: token, shortUrl: shortUrl }).success(function(user){
        res.end('Thanks, new user created.');
      }).error(function(err){
        res.end('Invalid request -> '+err);
      });
    });
  });
});

// API call to find a particular user from a given token.
app.get('/api/find-user-by-token', function(req, res){
  res.setHeader('Content-Type', 'application/json');
  var token = req.query.token;
  if (token){
    User.find({where:{token: token},attributes: ['id','firstName','token']}).success(function(user){
      if(user){
        res.end(JSON.stringify(user));
      }else{
        res.end(JSON.stringify({"Error":"No user found."}));
      };
    });
  }else{
    res.end(JSON.stringify({"Error":"No Token given."}));
  };
});

// API call to reset all tokens. Should be called once a week.
app.post('/api/reset-tokens', function(req, res){
  var token = req.body.token;
  if(token == process.env.SMS_REQUEST_TOKEN){
    helpers.resetTokensAndShortlinks(User, function(){
      res.end('Tokens and shortlinks reset.');
    });
  }else{
    res.end('Not today.');
  };
});

// API call to send SMS to all users. Should be called once at beginning of week.
app.post('/api/send-sms', function(req, res){
  var token = req.body.token;
  if(token == process.env.SMS_REQUEST_TOKEN){
    twilio.sendSmsToAllUsers(User, function(){
      res.end('Done sending SMS.');
    });
  else{
    res.end('Did not get correct token in params.');
  };
});

// Sync models with the DB and start server.
sequelize.sync().complete(function(err) {
  if (err) {
    throw err;
  } else {
    var port = process.env.PORT || 3000;
    app.listen(port);
    console.log('Listening on ' + port);
  }
}).error(function(err){
  console.log('ERROR:');
  console.log(err);
});
