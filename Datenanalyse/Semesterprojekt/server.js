// server.js
  // set up ===================================================================
  var express         = require('express');
  var app             = express();                  // create our app w/ express
  var mongoose        = require('mongoose');        // mongoose for mongodb
  var morgan          = require('morgan');          // log requests to the console (express4)
  var bodyParser      = require('body-parser');     // pull information from HTML POST (express4)
  var http            = require('http');
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
      res.render('pages/index', {error : ""});
    });

    app.get('/about', function(req, res) {
      res.render('pages/about');
    });

    // Datencrawler starten lassen.
    app.get('/crawlMovieData', function(req, res) {

      // Zunächst auf valide Eingaben prüfen.
      var startIndex = parseInt(req.query.startIndex);
      var stopIndex = parseInt(req.query.stopIndex);

      // Sollte es sich bei startIndex oder stopIndex nicht um Zahlenwerte handeln
      // wird abgebrochen.
      if(isNaN(startIndex) | isNaN(stopIndex)) {
        console.log("Invalid parameters!");
        res.end();
      } else if(parseInt(startIndex) > parseInt(stopIndex)) {
        console.log("StartIndex can't be bigger than stopIndex!");
        res.end();
      }

      // Jetzt über den WebCrawler alle angeforderten Filminfos holen lassen
    	webcrawler.getAllMovieInfosFor(startIndex, stopIndex);
      res.end();
    });

    // Filmeinträge über die IMDB ID suchen lassen.
    app.get('/findById', function(req, res) {

      var query = webcrawler.findByImdbId(req.query.imdbId);

      query.exec(function(err, movies) {
        if(err)
          return console.log(err);
        console.log(movies);
        res.render('pages/movie', movies[0]);
      });
    })

    app.get('/getAmountMoviesOfGenre', function(req, res) {
      var statistics;

      async.waterfall([
          function(callback) {
            webcrawler.getAmountMoviesOfGenre(callback)
          },
          function(resultSet, processCallback) {
            statistics = resultSet;
            processCallback(null);
          }
      ], function(err) {
        if(err) console.error(err);
        console.log(statistics);
        res.render('pages/moviesOfGenre', {stats: statistics});
      });
    })

    app.get('/getMoviesByOriginalLanguage', function(req, res) {
      var statistics;

      async.waterfall([
          function(callback) {
            webcrawler.getMoviesByOriginalLanguage(callback)
          },
          function(resultSet, processCallback) {
            statistics = resultSet;
            processCallback(null);
          }
      ], function(err) {
        if(err) console.error(err);
        console.log(statistics);
        res.render('pages/moviesByLanguage', {stats: statistics});
      });
    })

    app.get('/getMoviesPerYear', function(req, res) {
      var statistics;

      async.waterfall([
        function(callback) {
          webcrawler.getMoviesPerYear(callback)
        },
        function(resultSet, processCallback) {
          statistics = resultSet;
          processCallback(null);
        }
      ], function(err) {
        if(err) console.error(err);
        console.log(statistics);
        res.render('pages/moviesPerYear', {stats: statistics});
      });
    })

    app.get('/getMoviesPerYearAndGenre/:year', function(req, res) {
      var statistics;

      async.waterfall([
        function(callback) {
          webcrawler.getMoviesPerYearAndGenre(req.params.year, callback)
        },
        function(resultSet, processCallback) {
          statistics = resultSet;
          processCallback(null);
        }
      ], function(err) {
        if(err) console.error(err);
        console.log(statistics);
        res.render('pages/moviesPerYearAndGenre', {stats: statistics, year: req.params.year});
      });
    })

    app.get('/getByQuery/:page', function(req, res) {
      if(!req.query.queryString) {
        res.render('pages/404', {errorMessage: 'No valid input given.'});
      }

      var queryResultJSON;

      async.waterfall([
        function(callback) {
          webcrawler.liveSearchByText(req.query.queryString, req.params.page, callback);
        },
        function(resultSet, processCallback) {
          queryResultJSON = resultSet;
          processCallback(null);
        }
      ], function(err) {
        if(err) console.log(err);
        //console.log(queryResultJSON);
        res.render('pages/movie', JSON.parse(queryResultJSON));
      });
    });

    app.get('/getMovieById/:id', function(req, res) {
      var movieInfo;

      async.waterfall([
        function(callback) {
          webcrawler.getMovieById(req.params.id, callback);
        },
        function(resultSet, processCallback) {
          movieInfo = resultSet;
          processCallback(null);
        }
      ], function(err) {
        if(err) console.log(err);
        console.log(movieInfo);
        res.render('pages/movieDetail', JSON.parse(movieInfo));
      });
    })

    app.get('/getPopularMovies/:page', function(req, res) {
      if(!req.params.page | req.params.page <= 0) {
        res.render('pages/404', {errorMessage: 'The requested page is not valid.'});
      }

      var queryResultJSON;

      async.waterfall([
        function(callback) {
          webcrawler.getPopularMovies(req.params.page, callback);
        },
        function(resultSet, processCallback) {
          queryResultJSON = resultSet;
          processCallback(null);
        }
      ], function(err) {
        if(err) console.log(err);
        //console.log(queryResultJSON);
        res.render('pages/movie', JSON.parse(queryResultJSON));
      });
    });

    app.get('/getTopRatedMovies/:page', function(req, res) {
      if(!req.params.page | req.params.page <= 0) {
        res.render('pages/404', {errorMessage: 'The requested page is not valid.'});
      }

      var queryResultJSON;

      async.waterfall([
        function(callback) {
          webcrawler.getTopRatedMovies(req.params.page, callback);
        },
        function(resultSet, processCallback) {
          queryResultJSON = resultSet;
          processCallback(null);
        }
      ], function(err) {
        if(err) console.log(err);
        //console.log(queryResultJSON);
        res.render('pages/movie', JSON.parse(queryResultJSON));
      });
    });

    app.get('/getUpcomingMovies/:page', function(req, res) {
      if(!req.params.page | req.params.page <= 0) {
        res.render('pages/404', {errorMessage: 'The requested page is not valid.'});
      }

      var queryResultJSON;

      async.waterfall([
        function(callback) {
          webcrawler.getUpcomingMovies(req.params.page, callback);
        },
        function(resultSet, processCallback) {
          queryResultJSON = resultSet;
          processCallback(null);
        }
      ], function(err) {
        if(err) console.log(err);
        //console.log(queryResultJSON);
        res.render('pages/movie', JSON.parse(queryResultJSON));
      });
    });

    app.get('/getAveragesOfAllMovies', function(req, res) {
      var statistics;

      async.waterfall([
        function(callback) {
          webcrawler.getAveragesOfAllMovies(callback);
        },
        function(resultSet, processCallback) {
          statistics = resultSet;
          processCallback(null);
        }
      ], function(err) {
        if(err) console.log(err);
        console.log(statistics);
        res.render('pages/averagesOfAllMovies', {stats: statistics});
      });
    })

  // listen (start app with node server.js) ===================================
  app.listen(8080);
  console.log("App listening on port 8080");
