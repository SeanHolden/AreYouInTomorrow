// App Configuration

function configure(app, express, expressLayouts){
  app.configure(function() {
    app.set('view engine', 'ejs');
    app.set('views', __dirname+'/views');
    app.use(expressLayouts);
    app.use(express.static(__dirname + '/public'));
    app.use(express.bodyParser());
  });
}

module.exports = {
  configure : configure
};