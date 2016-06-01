// server.js
  // set up ===================================================================
  var express         = require('express');
  var app             = express();                  // create our app w/ express
  var mongoose        = require('mongoose');        // mongoose for mongodb
  var morgan          = require('morgan');          // log requests to the console (express4)
  var bodyParser      = require('body-parser');     // pull information from HTML POST (express4)
  var async           = require('async');
  var db              = require('./database.js');
  var webcrawler      = require('./webcrawler.js');
  // configuration ============================================================

  //mongoose.connect('mongodb://localhost:27017/movieDatabase');    // connect to mongodb

  app.use(express.static(__dirname + '/public'));                 // set the static files location /public/img will be /img for users
  app.use(morgan('dev'));                                         // log every request to the console
  app.use(bodyParser.urlencoded({'extended':'true'}));            // parse application/x-www-form-urlencoded
  app.use(bodyParser.json());                                     // parse application/json
  app.use(bodyParser.json({ type: 'application/vnd.api+json' })); // parse application/vnd.api+json as json
  // SET VIEWENGINE
  app.set('view engine', 'ejs');
  // use res.render to load up an ejs view file

  // routes ===================================================================

    // application ------------------------------------------------------------
    app.get('/', function(req, res) {
      //res.sendfile('./public/index.html');
      var drinks = [
        { name: 'Bloody Mary', drunkness: 3 },
        { name: 'Martini', drunkness: 5 },
        { name: 'Scotch', drunkness: 10 }
      ];
      var tagline = "Any code of your own that you haven't looked at for six or more months might as well have been written by someone else.";

      res.render('pages/index', {
        drinks: drinks,
        tagline: tagline
      });
    });

    app.get('/about', function(req, res) {
      res.render('pages/about');
    });

    // Datencrawler starten lassen.
    app.get('/crawlMovieData', function(req, res) {

      // Zunächst auf valide Eingaben prüfen.
      var startIndex = parseInt(req.query.startIndex);
      var stopIndex = parseInt(req.query.stopIndex);

      if(isNaN(startIndex) | isNaN(stopIndex)) {
        console.log("Invalid parameters!");
        res.end();
      } else if(parseInt(startIndex) > parseInt(stopIndex)) {
        console.log("StartIndex can't be bigger than stopIndex!");
        res.end();
      }

      // Jetzt das Array mit den URLs vorbereiten.
      var movieUrls = [];

      for(var i = startIndex; i <= stopIndex; i++) {
      //  var titleID = 'tt' + '0'.repeat(7 - String(i).length) + String(i);
      //  var url = 'http://www.omdbapi.com/?i=' + titleID + '&plot=full&r=json'
        var key = 'e5846a2f65ecdbaac8752910ca8993a8';
        var url = 'https://api.themoviedb.org/3/movie/' + i + '?api_key=' + key;
        movieUrls.push(url);
      }

      // For each movieUrl call fetchMovieData
    	webcrawler.getAllMovieInfosFor(movieUrls);
      res.end();
    });

    // Filmeinträge über die ID suchen lassen.
    app.get('/findById', function(req, res) {
      var id = parseInt(req.query.searchId);
      var query = webcrawler.findByImdbId(id);

      query.exec(function(err, movies) {
        if(err)
          return console.log(err);
        console.log(movies);
        res.render('pages/movie', movies[0]);
      });

    })

  // listen (start app with node server.js) ===================================
  app.listen(8080);
  console.log("App listening on port 8080");
