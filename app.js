//This will be an App that allows Slack users to get Data from openpowerlifting.org directly into the workspace
// Test

const fs = require('fs');
const fastcsv = require("fast-csv");
const unzip = require("unzip-stream");
const https = require('https');
const { Pool } = require('pg');

function readCSV(entry) {
    //let recordCount = 0;
    let csvData = [];

    let csvStream = fastcsv
        .parse()
        .on("data", function(data) {
            //recordCount++;
            csvData.push(data);
            //console.log(recordCount + ': ' + data)
        })
        .on("end", function() {
            // remove the first line: header
            csvData.shift();

            // save csvData
            updateDatabase(csvData);
        });

    entry.pipe(csvStream);
}

function unzipFolder(path) {
    let test = fs.createReadStream(path).pipe(unzip.Parse())
    test.on('entry', function(entry) {
        if (entry.type == 'File' && entry.path.endsWith('.csv')) { //exclude Folders and the .txt Files
            readCSV(entry) //CSV found --> process CSV
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

function updateDatabase(csvData) {
    let pool = new Pool({
        user: 'roylotzwik',
        host: 'localhost',
        database: 'openpl',
        password: '2duM2vrZh.',
        port: 9000,
    });

    let insertQuery = 'INSERT INTO lifterdata_csv_char' + //'(name, totalkg, place, date)'//
                "(name, sex, event, equipment, age, ageclass, birthyearclass, division, bodyweightkg, weightclasskg, squat1kg, squat2kg, squat3kg, squat4kg, best3squatkg, bench1kg, bench2kg, bench3kg, bench4kg, best3benchkg, deadlift1kg, deadlift2kg, deadlift3kg, deadlift4kg, best3deadliftkg, totalkg, place, dots, wilks, glossbrenner, goodlift, tested, country, state, federation, parentfederation, date, meetcountry, meetstate, meettown, meetname) " +
                'VALUES' + //(Test Roy, 700, 1, 2020-12-12';
                "($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25, $26, $27, $28, $29, $30, $31, $32, $33, $34, $35, $36, $37, $38, $39, $40, $41)";
    
    let clearQuery = 'TRUNCATE lifterdata_csv_char';

    pool.connect((err, client, done) => {
        if (err) throw err;
    
        try {
            client.query(clearQuery, (err, res) => { //Clear table, if success -> write
                if (err) {
                    console.log(err.stack);
                } else {
                    let rowCount = 0;
                    csvData.forEach(row => {
                        client.query(insertQuery, row, (err, res) => {
                            if (err) {
                                console.log(err.stack);
                            } else {
                                rowCount++;
                                console.log("inserted: " + rowCount);
                            }
                        });
                    });
                }
            })
        } finally {
            done();
        }
        });
}

//downloadZip('https://openpowerlifting.gitlab.io/opl-csv/files/openpowerlifting-latest.zip', '../testdata/openpowerlifting-latest.zip')
unzipFolder('../testdata/openpowerlifting-latest.zip')