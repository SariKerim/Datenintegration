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
	fs.writeFileSync("error.log", "");
}

function output(data) {
	writeToFile("output.csv", data);
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

fs.readFile('Liste_PPN-ExNr_HSHN-libre.csv', 'utf-8', function(err, inhalt) {
	if(err) {
		return console.log(err);
	}
	
	var lines = inhalt.split(/\r?\n/);
	var result = [];
	
	for(var i = 1; i < lines.length; i++) {
		
		var line = lines[i];
		var tokens = line.split(",");
		
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
	
	output(JSON.stringify(result, null, 2));
	
	console.log("Anzahl Zeilen: " + lines.length - 1);
});