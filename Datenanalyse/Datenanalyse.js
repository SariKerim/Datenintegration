// REQUIRED MODULES
fs = require('fs');

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
	fs.writeFileSync("ppn.txt", "");
	fs.writeFileSync("signaturen.txt", "");
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

//SKRIPTSTART

resetFiles();

fs.readFile('../Liste_PPN-ExNr_HSHN-libre.csv', 'utf-8', function(err, inhalt) {
	if(err) {
		return console.log(err);
	}
	
	var lines = inhalt.split(/\r?\n/);
	var result = [];
	
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
			result.push(exemplar);
		}
	}
	
	output("output.csv", JSON.stringify(result, null, 2));

	console.log("Anzahl Zeilen: " + (lines.length - 2));
	console.log("Anzahl vollständiger Datensätze: " + (result.length));
	
	getAllUniqueSignatures(result);
	getAllUniquePPN(result);
});

// Funktion zum auslesen aller einzigartigen Signaturen
function getAllUniqueSignatures(data) {
	var uniqueSignatures = [];
	var allSignatures = [];
	
	// Zunächst schieben wir alle Signaturen in ein eigenes Array
	for(var i = 0; i < data.length; i++) {
		allSignatures.push(data[i].signatur);
	}
	
	// Anschließend wird jede Signatur aus allSignatures die noch nicht in uniqueSignatures vorkommt
	// dorthin kopiert.
	for(var i = 0; i<allSignatures.length; i++) {
		if(uniqueSignatures.indexOf(allSignatures[i]) != -1) {
			continue;
		} else {
			uniqueSignatures.push(allSignatures[i]);
		}
	}
	
	output("signaturen.txt", JSON.stringify(uniqueSignatures));
	
	console.log("Anzahl einzigartiger Signaturen: " + (uniqueSignatures.length));
}

function getAllUniquePPN(data) {
	var uniquePPNs = [];
	var allPPNs = [];
	
	// Zunächst schieben wir alle Signaturen in ein eigenes Array
	for(var i = 0; i < data.length; i++) {
		allPPNs.push(data[i].ppn);
	}
	
	// Anschließend wird jede PPN aus allPPNs die noch nicht in uniquePPNs vorkommt
	// dorthin kopiert.
	for(var i = 0; i<allPPNs.length; i++) {
		if(uniquePPNs.indexOf(allPPNs[i]) != -1) {
			continue;
		} else {
			uniquePPNs.push(allPPNs[i]);
		}
	}
	
	output("ppn.txt", JSON.stringify(uniquePPNs));
	
	console.log("Anzahl einzigartiger PPNs: " + (uniquePPNs.length));
}

// Auslesen aller vorhandenen PPNs und wie oft diese vorkommen
function getCountPerPPN(data) {
	
	var duplicates = []
	
	for(var i = 0; i<1000; i++) {
		var ppnCount = 1;
		
		for(var j = 0; j<1000; j++) {
			if(i==j) {
				continue;
			} else {
				if(data[i].ppn == data[j].ppn) {
					ppnCount++;
				}
			}		
		}
		
		var ppn = {ppn: data[i].ppn, count: ppnCount};
		duplicates.push(ppn)
	}

	duplicates.forEach(function(element, index, array) {
		if(element.count > 1) {
			console.log("PPN: " + element.ppn);
			console.log("Anzahl: " + element.count);
		}
	})
}