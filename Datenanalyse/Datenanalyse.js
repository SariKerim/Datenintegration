// REQUIRED GLOBALS
var fs = require('fs');
var resultStream = fs.createWriteStream('results.txt');
var resultArray = [];

//SKRIPTSTART

resetFiles();
console.log("Lese Daten...");

fs.readFile('../Liste_PPN-ExNr_HSHN-libre.csv', 'utf-8', function(err, inhalt) {
	if(err) {
		return console.log(err);
	}
	
	var lines = inhalt.split(/\r?\n/);
	
	for(var i = 1; i < lines.length; i++) {
		
		var line = lines[i];
		var tokens = line.split(/,(?![^"]*"(?:(?:[^"]*"){2})*[^"]*$)/);
		
		if (tokens.length != 5) {
			error("Komische Zeile (" + (i+1) + "): " + line);
		} else {
			
			var exemplar = {
				ppn: checkPPN(tokens[0]),
				exemplar: tokens[1],
				signatur: tokens[2],
				barcode: tokens[3],
				sigel: tokens[4]
			};
			resultArray.push(exemplar);
		}
	}
	
	output("output.csv", JSON.stringify(resultArray, null, 2));

	console.log("Anzahl Zeilen: " + (lines.length - 2));
	console.log("Anzahl vollständiger Datensätze: " + (resultArray.length));
	console.log("Analysiere Daten...");
	
	// Original Author: Katharina Köhler
	var allEntries = resultArray.length;
	resultStream.write(
	getUniqueValues('sigel').length + ' Sigel sind verfügbar: ' + getUniqueValues('Sigel') + '\n' +
	getUniqueValues('ppn').length + ' unterschiedliche PPNs sind vorhanden. \n' +
	getUniqueValues('exemplar').length + ' einzigartige Exemplarnummern -> ' + ((allEntries) - (getUniqueValues('exemplar').length)) + ' haben einen Fehler. \n' +
	getUniqueValues('barcode').length + ' unterschiedliche Barcodes -> ' + ((allEntries) - (getUniqueValues('barcode').length)) + ' haben einen Fehler. \n' +
	getUniqueValues('signatur').length + ' unterschiedliche Signaturen \n' +
	'Histogram for the amount of exemplars per location:\n' + JSON.stringify(getExemplarsForKey('sigel'), 0, 2) + 
	'\nHistogram for the amount of exemplars per title:\n' + JSON.stringify(getExemplarsForKey('ppn'), 0, 2) 
	);
});

// HILFSFUNKTIONEN
function writeToFile(filename, data) {
	var err = fs.appendFileSync(filename, data)
	
	if(err) {
		console.log("Error writing to file " + filename + "!");
		throw err;
	}
}

function resetFiles() {
	fs.writeFileSync("output.csv", "");
	fs.writeFileSync("results.txt", "");
	fs.writeFileSync("error.log", "");
}

function output(fileName, data) {
	writeToFile(fileName, data);
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
	var tmpArray = resultArray.map(function (entry) {
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

// Original Author: Katharina Köhler
function getExemplarsForKey(key) {
	var tmpArray = {};
	
	for(var entry in resultArray) {
		var groupKey = resultArray[entry][key];
		
		if(groupKey in tmpArray) {
			tmpArray[groupKey] += 1;
		}
		else {
			tmpArray[groupKey] = 1;
		}
	}
	
	return tmpArray;
}

