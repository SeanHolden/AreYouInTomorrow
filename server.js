var express = require('express');
var expressLayouts = require('express-ejs-layouts');
var twilio = require('twilio');
var app = express();

// Settings
app.configure(function() {
  app.set('view engine', 'ejs');
  app.set('views', __dirname+'/views');
  app.use(expressLayouts);
  app.use(express.static(__dirname + '/public'));
});

app.get('/', function(request, response){
  response.setHeader('Content-Type', 'text/html');
  response.end("<p>Hello, world!</p>");
});

var port = process.env.PORT || 3000;
app.listen(port);
console.log('Listening on ' + port);