var mongoose = require('mongoose');
var dbCon = mongoose.connection;

mongoose.connect('mongodb://localhost:27017/movieDatabaseJSON');

dbCon.on('error', function callback() {
  console.log("DB Connection Error occured.");
});

dbCon.once('open', function callback() {
  console.log("DB Connection successful.");
});

dbCon.once('disconnect', function callback() {
  console.log("DB Connection lost.");
});
