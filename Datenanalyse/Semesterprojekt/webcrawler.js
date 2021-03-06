var http = require('http');
var async = require('async');
var mongoose = require('mongoose');

  var themoviedbBaseUrl = 'http://api.themoviedb.org/3/';
var apiKey = 'api_key=e5846a2f65ecdbaac8752910ca8993a8';

// Das Datenmodell für die Filme definieren. Es genügt die URL unter der die
// Anfrage für die Daten gestellt wurde und die Information die wir erhalten.
var Movie = mongoose.model('Movie', {
  RetrieveUrl: String,
  Data: Object
});

// Da die folgenden Funktionen des webcrawlers exportiert werden sollen, werden
// sie in einem Objekt abgelegt das später exportiert wird.
var webcrawler = {

  // Funktion zum crawlen von Filmdaten, anhand der IMDB ID. Wird eventuell
  // auf die ID der TheMovieDB geändert werden.
  getAllMovieInfosFor: function getAllMovieInfosFor(startFromId, stopById) {

    // Erst das Array mit den URLs vorbereiten.
    var movieUrls = [];

    for(var i = startFromId; i <= stopById; i++) {
      //var titleId = 'tt' + '0'.repeat(7 - String(i).length) + String(i);
      var url = themoviedbBaseUrl + 'movie/' + i + '?' + apiKey;
      movieUrls.push(url);
    }

    // For each movieUrl call fetchMovieData
    async.eachSeries(
      movieUrls,
      function(movieUrl, innerCallback) {
        //console.log('Processing movieUrl: ' + movieUrl);
        async.waterfall([
          async.apply(fetchMovieData, movieUrl),
          processData
        ], function(err) {
          if (err) console.error(err);
          innerCallback();
        });
      },
      function(err) {
        if (err) console.error(err);
      });
  },

  // Die direkte Suche in der lokalen MongoDB nach einer passenden IMDB
  // ID, wird eventuell in eine Live-Abfrage umgewandelt um damit
  // "localSearchByText" abzulösen.
  getMovieById: function getMovieById(id, callback) {
    var req = http.get(themoviedbBaseUrl + 'movie/' + id + '?' + apiKey,
      function(response) {
        // Continuously update stream with data
        var data = '';
        response.on('data', function(d) {
          data += d;
        });
        response.on('end', function() {
          console.log(themoviedbBaseUrl + 'movie/' + id + '?' + apiKey);
          console.log(data);
          callback(null, data);
        });
      });
      req.on('error', function(e) {
        console.error('ERROR: ' + e.message);
      });
  },

  // Eine Live-Abfrage über die API nach einem Film oder einer Serie.
  liveSearchByText: function liveSearchByText(text, page, callback) {
    var req = http.get(themoviedbBaseUrl + 'search/movie?query=' + text + '&page=' + page + '&' + apiKey,
      function(response) {
        // Continuously update stream with data
        var data = '';
        response.on('data', function(d) {
          data += d;
        });
        response.on('end', function() {
          console.log(themoviedbBaseUrl + 'search/movie?query=' + text + '&page=' + page + '&' + apiKey);
          callback(null, data);
        });
      });
      req.on('error', function(e) {
        console.error('ERROR: ' + e.message);
      });
  },

  getPopularMovies: function getPopularMovies(page, callback) {
    var req = http.get(themoviedbBaseUrl + 'movie/popular?page=' + page + '&' + apiKey,
      function(response) {
        // Continuously update stream with data
        var data = '';
        response.on('data', function(d) {
          data += d;
        });
        response.on('end', function() {
          console.log(themoviedbBaseUrl + 'movie/popular?page=' + page + '&' + apiKey);
          callback(null, data);
        });
      });
      req.on('error', function(e) {
        console.error('ERROR: ' + e.message);
      });
  },

  getTopRatedMovies: function getTopRatedMovies(page, callback) {
    var req = http.get(themoviedbBaseUrl + 'movie/top_rated?page=' + page + '&' + apiKey,
      function(response) {
        // Continuously update stream with data
        var data = '';
        response.on('data', function(d) {
          data += d;
        });
        response.on('end', function() {
          console.log(themoviedbBaseUrl + 'movie/top_rated?page=' + page + '&' + apiKey);
          callback(null, data);
        });
      });
      req.on('error', function(e) {
        console.error('ERROR: ' + e.message);
      });
  },

  getUpcomingMovies: function getUpcomingMovies(page, callback) {
    var req = http.get(themoviedbBaseUrl + 'movie/upcoming?page=' + page + '&' + apiKey,
      function(response) {
        // Continuously update stream with data
        var data = '';
        response.on('data', function(d) {
          data += d;
        });
        response.on('end', function() {
          console.log(themoviedbBaseUrl + 'movie/upcoming?page=' + page + '&' + apiKey);
          callback(null, data);
        });
      });
      req.on('error', function(e) {
        console.error('ERROR: ' + e.message);
      });
  },

  // Diese Funktion führt eine Aggregation des lokalen Datenbestands durch.
  // Dabei werden Informationen zur Anzahl an Filmen pro Genre zurückgegeben,
  // die später verarbeitet werden.
  getAmountMoviesOfGenre: function getAmountMoviesOfGenre(callback) {
    Movie.aggregate(
      [
        { $unwind : {
                      path: '$Data.genres',
                      preserveNullAndEmptyArrays: false
                    }
        },
        { $group: {
                    _id: '$Data.genres.name',
                    movies: { $sum: 1 }
                  }
        },
        {
          $sort:  { movies: 1 }
        }
      ],
      function(err, res) {
        if(err) return console.log(err);
        callback(null, res);
      }
    );
  },

  // Diese Funktion führt eine Aggregation des lokalen Datenbestands durch.
  // Dabei werden Informationen zur Anzahl an Filmen pro originaler Sprachausgabe
  // zurückgegeben, die später verarbeitet werden.
  getMoviesByOriginalLanguage: function getMoviesByOriginalLanguage(callback) {
    Movie.aggregate(
      [
        {
          $match: { 'Data.original_language': { $ne: null } }
        },
        { $group: {
                    _id: '$Data.original_language',
                    count: { $sum: 1 }
                  }
        },
        {
          $sort: { count: 1 }
        }
      ],
      function(err, res) {
        if(err) return console.log(err);
        callback(null, res);
      }
    );
  },

  getMoviesPerYear: function getMoviesPerYear(callback) {
    Movie.aggregate(
      [
        {
          $match: { 'Data.release_date': { $ne: null } }
        },
        {
          $group: {
                    _id: { $substr : ['$Data.release_date', 0, 4] },
                    count: { $sum: 1}
                  }
        },
        {
          $sort: { _id: 1 }
        }
      ],
      function(err, res) {
        if(err) return console.log(err);
        callback(null, res);
      }
    );
  },

  getMoviesPerYearAndGenre: function getMoviesPerYearAndGenre(year, callback) {
    Movie.aggregate(
      [
        {
          $project: {
                      'Data.release_date' : 1,
                      'Data.genres' : 1,
                      year : { $substr : ['$Data.release_date', 0, 4] }
                    }
        },
        {
          $match: { 'year' : year }
        },
        {
          $unwind: {
                      path: '$Data.genres',
                      preserveNullAndEmptyArrays: false
                   }
        },
        {
          $group: {
                    _id: '$Data.genres.name',
                    count: { $sum: 1}
                  }
        },
        {
          $sort: { _id: 1 }
        }
      ],
      function(err, res) {
        if(err) return console.log(err);
        callback(null, res);
      }
    );
  },

  getAveragesOfAllMovies: function getAveragesOfAllMovies(callback) {
    Movie.aggregate(
      [
        {
          $project: {
                      'Data.genres' : 1,
                      'Data.vote_count' : 1,
                      'Data.vote_average' : 1,
                      'Data.runtime': 1,
                      'Data.adult': { $cond: ['$Data.adult', 1, 0] }
                    }
        },
        {
          $unwind: {
                      path: '$Data.genres',
                      preserveNullAndEmptyArrays: false
                    }
        },
        {
          $group: {
                    _id: '$Data.genres.name',
                    avgRating: { $avg: '$Data.vote_average' },
                    avgVoteCount: { $avg: '$Data.vote_count' },
                    avgRuntime: { $avg: '$Data.runtime' },
                    totalMovieCount: { $sum: 1},
                    totalAdultMovies: { $sum: '$Data.adult'},
                  }
        },
        {
          $project: {
                      _id: 1,
                      avgRating: 1,
                      avgVoteCount: 1,
                      avgRuntime: 1,
                      totalMovieCount: 1,
                      totalAdultMovies: 1,
                      avgIsAdult: { $divide: ['$totalAdultMovies', '$totalMovieCount'] }
                    }
        },
        {
          $sort: { _id: 1 }
        }
      ],
      function(err, res) {
        if(err) return console.log(err);
        callback(null, res);
      }
    );
  }
}


// Helper Functions =========================================================
function processData(movieUrl, data, callback) {
  // Retrieve Data and parse response data to json format
  try {
    var movie = new Movie();
    movie.RetrieveUrl = movieUrl;
    movie.Data = JSON.parse(data);

    // save data to db
    movie.save(function(err, res) {
      if (err) return console.error(err);
      console.log('Data for ' + movieUrl + ' saved to db');
      callback();
    });
  }
  catch(err) {
    console.log(err);
    callback();
  }
}

function fetchMovieData(movieUrl, callback) {
  var req = http.get(movieUrl, function(response) {
    // Continuously update stream with data
    var data = '';
    response.on('data', function(d) {
      data += d;
    });
    response.on('end', function() {
      callback(null, movieUrl, data);
    });
  });
  req.on('error', function(e) {
    console.error('ERROR: ' + e.message);
  });
}

module.exports = webcrawler;
