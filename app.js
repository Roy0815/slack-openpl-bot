//This will be an App that allows Slack users to get Data from openpowerlifting.org directly into the workspace
// Test

const fs = require('fs'); 
const etl = require("etl");
const unzip = require("unzip-stream");

function readCSV(entry) {
    let recordCount = 0;
    let etlcsv = entry.pipe(etl.csv())
    etlcsv.pipe(etl.map(d => {
        console.log(d);
        recordCount++;
        if (recordCount > 5) {
            etlcsv.destroy();
            entry.autodrain();
        }
    }))
}

function unzipFolder() {
    let test = fs.createReadStream('openipf-latest.zip').pipe(unzip.Parse())
    test.on('entry', function(entry) {
        if (entry.type == 'File' && entry.path.endsWith('.csv')) { //exclude Folders and the .txt Files
            readCSV(entry)
        }
    })
}

unzipFolder()