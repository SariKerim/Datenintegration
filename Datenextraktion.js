fs = require('fs');

// Einlesen der Daten und aufsplitten der einzelnen Zeilen
fs.readFile('Liste_PPN-ExNr_HSHN-libre.csv', 'utf8', function(err, data) {
	if(err) {
		return console.log(err);
	}
	
	var lines = data.split('\n');
	
	SplitLinesAndLogToConsole(lines);
});

// Aufspalten der Datensätze in die einzelnen Elemente
function SplitLinesAndLogToConsole(arrToSplit) {
	
	var arrDataOfLine = [];
	
	for(var i = 1; i < arrToSplit.length; i++) {
		var arrElementsOfLine = arrToSplit[i].split(',');
		
		arrDataOfLine.push(new Datensatz(arrElementsOfLine[0], arrElementsOfLine[1], arrElementsOfLine[2], arrElementsOfLine[3], arrElementsOfLine[4]));
	}
	
	LogInformation(arrDataOfLine);
};

// Ausgabe der Arrayinhalte in der Konsole
function LogInformation(arrToLog) {
	
	for(var i = 5000; i < 5050; i++) {
		var sOutput = 
		  "PPN: \t\t" + arrToLog[i].PPN + "\n" 
		+ "EDN: \t\t" + arrToLog[i].ExemplarDatensatzNummer + "\n"
		+ "Signatur: \t" + arrToLog[i].Signatur + "\n"
		+ "Barcode: \t" + arrToLog[i].Barcode + "\n"
		+ "Sigel: \t\t" + arrToLog[i].Sigel + "\n"
		+ "--------------------------------------------------------------------"
		
		console.log(sOutput);
	}
	
};

// Objektstruktur zum speichern der Datensätze
function Datensatz(PPN, ExemplarDatensatzNummer, Signatur, Barcode, Sigel) {
	this.PPN = CheckPPN(PPN);
	this.ExemplarDatensatzNummer = ExemplarDatensatzNummer;
	this.Signatur = Signatur;
	this.Barcode = Barcode;
	this.Sigel = Sigel;
};

// Funktion zum überprüfen der PPN
function CheckPPN(PPN) {
	
	var optimizedPPN = PPN;
	
	if(PPN.length == 9) {
		return PPN;
	} else if(PPN.length < 9) {
		while(optimizedPPN.length < 9) {
			optimizedPPN = "0" + optimizedPPN;
		}
		
		return optimizedPPN;
	}
};