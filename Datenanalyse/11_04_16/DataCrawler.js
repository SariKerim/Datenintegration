// Retrieve
var MongoClient = require('mongodb').MongoClient;
var Request = require('request');

// Connection URL
var databaseUrl = "mongodb://localhost:27017/swb";
var requestUrl = "http://swb.bsz-bw.de/sru/DB=2.1/username=/password=/?query=pica.ppn+%3D+%22100021549%22&operation=searchRetrieve&recordSchema=marcxml";

// SKRIPTSTART

// Lade alle einzigartigen PPNs in ein Array...
// Baue für jede PPN eine requestURL -> starte einen XML request -> speichere die PPN mit der XML in die MongoDB Datenbank
// Anschließend extrahieren von Informationen über XPath


// Connect to the database
MongoClient.connect(databaseUrl, function(err, db) {
	if(!err) {
		console.log("We are connected!");
	}
	
	// Get the documents collection
	var collection = db.collection('catalog');
	
	// Create some catalog entries
	var title1 = {ppn: '100021549', xml: "<xml></xml>"};
	var title2 = {ppn: '100036414', xml: "<xml></xml>"};
	
	// Insert catalog entries
	collection.insert([title1, title2], function(err, result) {
		if(err) {
			console.log(err);
		} else {
			console.log('Inserted %d documents into the "catalog" collection. The documents ' +
			'inserted with "_id" are: ', result.length, result);
		}
	});
	
	// Search for specific entry and log it to console
	collection.findOne({ppn: '100021549'}, function(err, result) {
		if(err) {
			console.log(err);
		} else {
			console.log(result);
		}
	});
});

// HELPER METHODS

// Method to receive the body (xml) of the requested PPN
function requestXml(url) {
	request(url, function(err, response, body) {
		if(err) {
			console.log(err);
		} else {
			return body;
		}
	});
}