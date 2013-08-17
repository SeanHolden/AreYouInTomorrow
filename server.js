// TODO:
// * Create an API JSON view for the current week, monday to friday for all users.
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

app.get('/test/whosinonthisday', function(req, res){
  if(req.query.date){
    checkDateValid(req.query.date, function(validDate){
      if(validDate){
        whosInOnThisDay(validDate, function(){
          res.end('Done');
        });
      }else{
        res.end('Date invalid');
      };
    });
  }
});

function checkDateValid(date, callback){
  if( date.match(/^\d{4}-\d\d?-\d\d?$/ ) ){
    callback(date);
  }else{
    callback(null);
  };
}

function whosInOnThisDay(dateString, callback){
  var date = new Date(dateString+' GMT');
  When.findAll({where:{date:date},include:[User]}).success(function(whens){
    var responses = {};
    for(var i=0;i<whens.length;i++){
      var user = whens[i].user.dataValues.firstName;
      responses[user] = whens[i].dataValues.areYouIn;
    };
    console.log(JSON.stringify(responses));
    callback();
  });
}

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
