// Retrieve
var fs = require('fs');
var MongoClient = require('mongodb').MongoClient;
var request = require('request');
var async = require('async');
var http = require('http');

// Connection URL and request URL. The request URL will be modified for each PPN.
var databaseUrl = "mongodb://localhost:27017/swb";
var requestUrl = "http://swb.bsz-bw.de/sru/DB=2.1/username=/password=/?query=pica.ppn+%3D+%22100021549%22&operation=searchRetrieve&recordSchema=marcxml";

// Input-File Path and placeholder array for input data
var filePath = "C:\\Users\\sarik\\Documents\\Datenintegration\\Liste_PPN-ExNr_HSHN-libre.csv"
var arrInput = [];
var arrUniquePPN = [];
var arrTitles = [];

var db;
var insertionCount = 0;

// SKRIPTSTART

// Initialize connection once
MongoClient.connect(databaseUrl, function(err, database) {
	if(err) {
		console.log(err);
	} else {
		db = database;
		
		console.log("Database connection established...");
	}
});

// Lade alle einzigartigen PPNs in ein Array...
fs.readFile(filePath, 'utf-8', function(err, content) {
	if(err) {
		return console.log(err);
	}
	
	console.log("Reading data...");
	
	var lines = content.split(/\r?\n/);
	
	for(var i = 1; i < lines.length; i++) {
		
		var line = lines[i];
		var tokens = line.split(/,(?![^"]*"(?:(?:[^"]*"){2})*[^"]*$)/);
		
		if (tokens.length != 5) {
			error("Strange row (" + (i+1) + "): " + line);
		} else {
			
			var exemplar = {
				ppn: checkPPN(tokens[0]),
				exemplar: tokens[1],
				signatur: tokens[2],
				barcode: tokens[3],
				sigel: tokens[4]
			};
			arrInput.push(exemplar);
		}
	}

	console.log("Processing and inserting data to database...");
	
	// First extract all unique PPN
	arrUniquePPN = getUniqueValues('ppn');
	
	// Generate a unique requestURL for each PPN
	arrUniquePPN = arrUniquePPN.map(function(element) {
		var	requestUrl = "http://swb.bsz-bw.de/sru/DB=2.1/username=/password=/?query=pica.ppn+%3D+%22" + element + "%22&operation=searchRetrieve&recordSchema=marcxml";
		
		return {ppn: element, url: requestUrl};
	});
	
	
	// Now get the XML information for each PPN and store it to the database.
	arrUniquePPN.forEach(function(element, index, array) {
		
		request(element.url, function(err, response, body) {
			if (!err && response.statusCode == 200) {
				parseHtmlResponse(element.ppn, body);
			} else {
				console.log(err);
			}
		});	
	});
	/*
	async.eachLimit(arrUniquePPN, 100, function(uniquePpn, callback) {
		
		request(uniquePpn.url, {timeout: 5000}, function(err, response, body) {
			if (!err && response.statusCode == 200) {
				parseHtmlResponse(uniquePpn.ppn, body);
			} else {
				console.log(err);
			}
		}, function(err) {
			if(err) {
				console.log(err);
			}
		});
		
	});
	*/
});

// HELPER METHODS

// Method to receive the body (xml) of the requested PPN and insert the document into the collection of the db.
function parseHtmlResponse(ppn, text) {
	// Get the documents collection
	var collection = db.collection('catalog');
	
	// Create Title to insert
	var title = {ppn: ppn, xml: text}
	
	// Insert catalog entries
	collection.insert(title, function(err, result) {
		if(err) {
			console.log(err);
		} else {
			insertionCount++;
			
			if(insertionCount === arrUniquePPN.length) {
				console.log("------------------------------------------------------------------------------------------");
				console.log("Transaction completed.");
				console.log("Total amount of items inserted into database: " + insertionCount);
				console.log("------------------------------------------------------------------------------------------");
			}
		}
	});
	
}

function writeToFile(filename, data) {
	var err = fs.appendFileSync(filename, data)
	
	if(err) {
		console.log("Error writing to file " + filename + "!");
		throw err;
	}
}

function error(data) {
	writeToFile("error.log", data);
}

function checkPPN(ppn) {
	
	var optimizedPPN = ppn;
	
	if(ppn.length == 9) {
		return ppn;
	} else if(ppn.length < 9) {
		while(optimizedPPN.length < 9) {
			optimizedPPN = "0" + optimizedPPN;
		}
		
		return optimizedPPN;
	}
};

// Original Author: Katharina Köhler
function getUniqueValues(keyName) {
	var seen = {}
	var tmpArray = arrInput.map(function (entry) {
		return entry[keyName];
	});
	return tmpArray.filter(function(x) {
		if(seen[x]) {
			return;
		}
		seen[x] = true;
		return x;
	});
}