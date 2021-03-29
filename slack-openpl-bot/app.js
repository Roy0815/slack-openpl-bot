//This will be an App that allows Slack users to get Data from openpowerlifting.org directly into the workspace
// Test

const fs = require('fs'); 
const etl = require("etl");
const unzip = require("unzip-stream");
const https = require('https');
const { Client } = require('pg');

function readCSV(entry) {
    let recordCount = 0;
    let etlcsv = entry.pipe(etl.csv())
    etlcsv.pipe(etl.map(d => {
        console.log(d);
        recordCount++;
        if (recordCount > 5) { //Process only 5 records for now
            etlcsv.destroy();
            entry.autodrain();
        }
    }))
}

function unzipFolder(path) {
    let test = fs.createReadStream(path).pipe(unzip.Parse())
    test.on('entry', function(entry) {
        if (entry.type == 'File' && entry.path.endsWith('.csv')) { //exclude Folders and the .txt Files
            readCSV(entry)
        }
    })
}

function downloadZip(url, path) {
    https.get(url, function(response) {
        switch(response.statusCode) {
            case 200:
                var file = fs.createWriteStream(path); //save file
                response.on('data', function(chunk){
                    file.write(chunk);
                }).on('end', function(){
                    file.end();
                    unzipFolder(path) //downloading done -> extract data
                });
                break;
            default:
                console.log('An Error occured while downloading')
        }
    })
}

//downloadZip('https://openpowerlifting.gitlab.io/opl-csv/files/openpowerlifting-latest.zip', 'openpowerlifting-latest.zip')

let client = new Client({
    user: 'roylotzwik',
    host: 'localhost',
    database: 'openpl',
    password: '2duM2vrZh.',
    port: 9000,
});

client.connect()
.then(() => {
    console.log('Connected!');
})
.catch(err => {
    console.log(err);
})
.finally(() => {
    client.end();
});