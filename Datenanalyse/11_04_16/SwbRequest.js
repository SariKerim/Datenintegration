var request = require("request");

var url = "http://swb.bsz-bw.de/sru/DB=2.1/username=/password=/?query=pica.ppn+%3D+%22100021549%22&operation=searchRetrieve&recordSchema=marcxml";

request(url, function(err, response, body) {
	if(err) {
		console.log(err);
	} else {
		console.log(body);
	}
});