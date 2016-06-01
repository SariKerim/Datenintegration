var http = require('https');
var async = require('async');
var mongoose = require('mongoose');

var Movie = mongoose.model('Movie', {
  RetrieveUrl: String,
  Data: Object
});

var webcrawler = {
  getAllMovieInfosFor: function getAllMovieInfosFor(movieUrls) {
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
  findByImdbId: function findMovieByImdbId(Id) {
    // Die SuchID um führende Nullen ergänzen.
    var titleId = 'tt' + '0'.repeat(7 - String(Id).length) + String(Id);
    var query =   Movie.find({'Data.imdb_id': titleId}).lean();
    return query;
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
