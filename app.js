//This will be an App that allows Slack users to get Data from openpowerlifting.org directly into the workspace
// Test

var fs = require('fs'); 
var parse = require('csv-parse');
var parser = parse({columns: true}, function (err, records) {
	console.log(records);
});

fs.createReadStream('openipf-2021.csv').pipe(parser);