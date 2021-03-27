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