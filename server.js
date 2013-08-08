var express = require('express');
var expressLayouts = require('express-ejs-layouts');
var twilio = require('twilio');
var sequelize = require('./config/database').setup();
var helpers = require('./lib/helpers');
var app = express();


// Settings
app.configure(function() {
  app.set('view engine', 'ejs');
  app.set('views', __dirname+'/views');
  app.use(expressLayouts);
  app.use(express.static(__dirname + '/public'));
  app.use(express.bodyParser());
});

// Define models
var User = sequelize.import(__dirname + "/models/user");

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
//   User.find({ where: { firstName: 'Sean' } }).success(function(user) {
//     console.log('Found this user: ' + user.firstName + ' with ID: ' + user.id);
//   })
// });

// app.get('/createdan', function(request, response){
//   User.create({ firstName: 'Sean' }).success(function(record) {
//     console.log('created new record:');
//     console.log(record.dataValues);
//   });
// });

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

