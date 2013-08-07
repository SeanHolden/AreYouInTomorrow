var express = require('express');
var expressLayouts = require('express-ejs-layouts');
var twilio = require('twilio');
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

var port = process.env.PORT || 3000;
app.listen(port);
console.log('Listening on ' + port);