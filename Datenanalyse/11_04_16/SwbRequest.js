var request = require("request");

var arrTitles = [];

var arrPpn = ['100021549', '100198856', '051360209', '05136817X', '05138387X'];

arrPpn.forEach(function(element, index, array) {
	
	var	requestUrl = "http://swb.bsz-bw.de/sru/DB=2.1/username=/password=/?query=pica.ppn+%3D+%22" + element + "%22&operation=searchRetrieve&recordSchema=marcxml";
	
	request(requestUrl, function(err, response, body) {
		if (!err && response.statusCode == 200) {
			parseMyHTML(element, body); // JSON.parse(body) sollte auch funktionieren?
		} else {
			console.log(err);
		}
	});	
	
});

function parseMyHTML(ppn, text) {
	var title = {ppn: ppn, xml: text}
	
	arrTitles.push(title);
	console.log(title.ppn + " " + title.xml.length + "\n");
}