//This will be an App that allows Slack users to get Data from openpowerlifting.org directly into the workspace

const fs = require('fs');
const unzip = require('unzip-stream');
const https = require('https');
const { Pool } = require('pg');
require('dotenv').config();

const csvPath = '../testdata/openpowerlifting-latest.csv';
const zipPath = '../testdata/openpowerlifting-latest.zip';
const openPLurl = 'https://openpowerlifting.gitlab.io/opl-csv/files/openpowerlifting-latest.zip';
const fullCsvPath = '/home/slack-openpl-bot/testdata/openpowerlifting-latest.csv'

function unzipFolder() {
    fs.createReadStream(zipPath).pipe(unzip.Parse())
    .on('entry', (entry) => {
        if (entry.type == 'File' && entry.path.endsWith('.csv')) { //exclude Folders and the .txt Files
            entry.pipe(fs.createWriteStream(csvPath)); //CSV found --> save to system
        } else {
            entry.autodrain(); //leave the ones we don't need
        }
    })
    .on('finish', () => {
        fs.unlink(zipPath, (err) => { if (err) { console.log(err) } }); // delete ZIP
        updateDatabase();
    }); 
}

function downloadZip() {
    https.get(openPLurl, function(response) {
        switch(response.statusCode) {
            case 200:
                let file = fs.createWriteStream(zipPath); //save file
                response.on('data', function(chunk){
                    file.write(chunk);
                }).on('end', function(){
                    file.end();
                    unzipFolder(zipPath) //downloading done -> extract data
                });
                break;
            default:
                console.log('An Error occured while downloading')
        }
    }).on("error", (err) => {
        console.log('An Error occured while downloading')
    })
}

function updateDatabase() {
    let pool = new Pool({
        user: process.env.POSTGRES_USER,
        host: process.env.POSTGRES_HOST,
        database: 'openpl',
        password: process.env.POSTGRES_PASSWORD,
        port: process.env.POSTGRES_PORT,
    });

    let query = 'CREATE TEMP TABLE lifterdata_csv_char_temp ON COMMIT DROP ' +
                'AS SELECT * FROM public.lifterdata_csv_char WITH NO DATA;' +

                'COPY lifterdata_csv_char_temp (name, sex, event, equipment, age, ageclass, birthyearclass, division, bodyweightkg, weightclasskg, squat1kg, squat2kg, squat3kg, squat4kg, best3squatkg, bench1kg, bench2kg, bench3kg, bench4kg, best3benchkg, deadlift1kg, deadlift2kg, deadlift3kg, deadlift4kg, best3deadliftkg, totalkg, place, dots, wilks, glossbrenner, goodlift, tested, country, state, federation, parentfederation, date, meetcountry, meetstate, meettown, meetname) ' +
                'FROM \'' + fullCsvPath + '\'' + 'DELIMITER \',\' CSV HEADER QUOTE \'"\' ' +
                'ESCAPE \'\'\'\' FORCE NOT NULL bodyweightkg, totalkg, division;' +
                
                'TRUNCATE public.lifterdata_csv_char;' +

                'INSERT INTO public.lifterdata_csv_char ' +
                'SELECT * FROM lifterdata_csv_char_temp ON CONFLICT DO NOTHING;';

    //query = 'SELECT * FROM public.lifterdata_csv_char LIMIT 10;'

    pool.connect((err, client, done) => {
        if (err) throw err;
        try {
            client.query(query, (err, res) => {
                if (err) {
                    console.log('Error in Database query');
                    console.log(err.stack);
                } else {
                    console.log('Database updated!')
                    console.log(res)
                }
                fs.unlink(csvPath, (err) => { if (err) { console.log(err) } }); // delete CSV
                done();
            })
        } finally {
            //done();
        }
        });
}

function startUpdateDatabase () {
    downloadZip();
}

//updateDatabase();
startUpdateDatabase();