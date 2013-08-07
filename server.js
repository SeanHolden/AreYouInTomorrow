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
  app.use(express.bodyParser());
});

app.get('/', function(request, response){
  response.setHeader('Content-Type', 'text/html');
  response.render('index');
  response.end();
});

app.post('/response', function(request, response){
  console.log("Body = " + request.body.Body);
  console.log("From = " + request.body.From);

  var body = request.body.Body;
  var from = request.body.From;

  if( body.trim()[0] == '1' ){
    console.log('Yep, %s will be in tomorrow', from);
  }else if(body.trim()[0] == '2' ){
    console.log('Nope, %s will not be in tomorrow', from);
  }else if(body.trim()[0] == '3' ){
    console.log('Maybe %s will be in tomorrow', from);
  }else{
    console.log('Unrecognised response. Not 1, 2 or 3.');
  };

  response.end("Thanks, message received!");
});

var port = process.env.PORT || 3000;
app.listen(port);
console.log('Listening on ' + port);