var express = require('express');
var expressLayouts = require('express-ejs-layouts');
var twilio = require('twilio');
var Sequelize = require("sequelize");
var DB = require('./config/database');
var getHelpers = require('./lib/helpers');
var app = express();

// Set up custom helper functions
var helpers = getHelpers();

// Settings
app.configure(function() {
  app.set('view engine', 'ejs');
  app.set('views', __dirname+'/views');
  app.use(expressLayouts);
  app.use(express.static(__dirname + '/public'));
  app.use(express.bodyParser());
});

////////////////////////////////////////////////

// Set up database config
var db = DB();
var sequelize = db.setup();

// Define models
var User = sequelize.define('User', {
  firstName: { type: Sequelize.STRING,
               validate: {
                 notNull: true
               }
             }
});

// Sync models with the DB (create tables)
sequelize.sync().complete(function(err) {
  if (err) {
    throw err;
  } else {
    var port = process.env.PORT || 3000;
    app.listen(port);
    console.log('Listening on ' + port);
  }
});

//////////////////////////////////////////////////

// Routes
app.get('/', function(request, response){
  response.setHeader('Content-Type', 'text/html');
  response.render('index');
  response.end();
});

app.post('/response', function(request, response){
  var body = request.body.Body;
  var from = request.body.From;
  helpers.processResponse(body, from, response, function(response){
    response.end("Thanks, message received!");
  });
});

// app.get('/testdb', function(request, response){
//   User.find({ where: { firstName: 'Dan' } }).success(function(user) {
//     console.log('Found this user: ' + user.firstName + ' with ID: ' + user.id);
//   })
// });

// app.get('/createdan', function(request, response){
//   User.create({ firstName: 'Dan' }).success(function(record) {
//     console.log('created new record: %s', record.dataValues);
//   });
// });

