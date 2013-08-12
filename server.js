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
app.get('/', function(request, response){
  response.setHeader('Content-Type', 'text/html');
  response.render('index');
  response.end();
});

app.post('/response', function(request, response){
  var body = request.body.Body;
  var from = request.body.From;
  helpers.processResponse(User, When, body, from, response, function(response){
    response.end("Thanks, message received!");
  });
});

app.get('/api/users', function(request, response){
  User.findAll({include:[When]}).success(function(users){
    console.log('################################################');
    console.log(JSON.stringify(users))
    response.end('Thanks');
  });
});

app.post('/api/create-user', function(request, response){
  var firstname = request.body.firstname;
  var msisdn = request.body.msisdn;
  User.create({ firstName: firstname, msisdn: msisdn }).success(function(record){
    console.log('created new record:');
    console.log(record.dataValues);
    response.end('Thanks');
  });
});

app.post('/api/inoffice', function(request, response){
  var date = request.body.date;
  var areyouin = request.body.areyouin;
  var msisdn = request.body.msisdn;
  if( date.match(/^\d{4}-\d\d?-\d\d?$/ ) ){
    helpers.createNewWhenRecord(User, When, date, areyouin, msisdn, response, function(err, response){
      if(err){
        response.end('No record for user.');
      }else{
        response.end('Thanks, response has been saved.');
      }
    });
  }else{
    response.end('Date is in wrong format');
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
});

