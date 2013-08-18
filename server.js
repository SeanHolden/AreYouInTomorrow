// TODO:
// * Display results in a feed. Weekly or daily.
// * Add lastName to database
// * Create a front end way of allowing users to register their name and mobile number

var express = require('express');
var expressLayouts = require('express-ejs-layouts');
var twilio = require('twilio');
var sequelize = require('./config/database').setup();
var helpers = require('./lib/helpers');
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
  res.render('index', {layout:'layouts/layout'});
  res.end();
});

app.post('/mobileresponse', function(req, res){
  res.setHeader('Content-Type', 'application/json');
  helpers.processResponse(User, When, req, function(msg){
    res.end(msg);
  });
});

app.get('/api/users', function(req, res){
  res.setHeader('Content-Type', 'application/json');
  User.findAll({include:[When]}).success(function(users){
    res.end(JSON.stringify(users));
  });
});

app.post('/api/create-user', function(req, res){
  var firstname = req.body.firstname;
  var msisdn = req.body.msisdn;
  User.create({ firstName: firstname, msisdn: msisdn }).success(function(user){
    res.end('Thanks, new user created.');
  });
});

app.get('/api/whosinonthisday', function(req, res){
  res.setHeader('Content-Type', 'application/json');
  if(req.query.date){
    helpers.checkDateValid(req.query.date, function(validDate){
      if(validDate){
        helpers.whosInOnThisDay(When, User, validDate, function(objResponse){
          res.end(JSON.stringify(objResponse));
        });
      }else{
        res.end('{"Error": "Date invalid. Please use the following format: yyyy-mm-dd"}');
      };
    });
  }
});

app.get('/api/whosinthisweek', function(req ,res){
  res.setHeader('Content-Type', 'application/json');
  if(req.query.date){
    helpers.checkDateValid(req.query.date, function(validDate){
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
  }
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
});
