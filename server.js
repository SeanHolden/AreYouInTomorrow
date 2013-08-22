// TODO:
// * Use bitly API to generate shortlinks to send out via SMS
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

app.post('/mobileresponse', function(req, res){
  res.setHeader('Content-Type', 'application/json');
  helpers.processResponse(User, When, req, function(msg){
    res.end(msg);
  });
});

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

app.post('/myweek', function(req, res){
  var token = req.body.token;

  User.find({where:{token:token}}).success(function(user){
    if(user){
      helpers.saveWeekForUser(req.body, When, user, res);
    }else{
      res.end('Oops. No user found under this token.');
    };
  });
});

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

app.post('/api/create-user', function(req, res){
  var firstname = req.body.firstname;
  var msisdn = req.body.msisdn;
  helpers.generateToken(function(token){
    User.create({ firstName: firstname, msisdn: msisdn, token: token }).success(function(user){
      res.end('Thanks, new user created.');
    });
  });
});

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

app.post('/api/reset-tokens', function(req, res){
  var query = req.body.valid;
  if(query == 'valid'){
    helpers.resetTokens(User, function(){
      res.end('Tokens reset.');
    });
  }else{
    res.end('Not today.');
  };
});

// Get all users.
// app.get('/api/users', function(req, res){
//   res.setHeader('Content-Type', 'application/json');
//   User.findAll({include:[When]}).success(function(users){
//     res.end(JSON.stringify(users));
//   });
// });

// Get all users in on one particular day.
// Usage. Call get request on this route, passing a date as a query.
// Query should be in following format: date=yyyy-mm-dd
// app.get('/api/whosinonthisday', function(req, res){
//   res.setHeader('Content-Type', 'application/json');
//   if(req.query.date){
//     helpers.checkDateValid(req.query.date, function(validDate){
//       if(validDate){
//         helpers.whosInOnThisDay(When, User, validDate, function(objResponse){
//           res.end(JSON.stringify(objResponse));
//         });
//       }else{
//         res.end('{"Error": "Date invalid. Please use the following format: yyyy-mm-dd"}');
//       };
//     });
//   }
// });



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
