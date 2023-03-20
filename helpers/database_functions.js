// file with all functions for database read/ write actions
const fs = require("fs");
const unzip = require("unzip-stream");
const https = require("https");
const { Pool } = require("pg");
const slack_cons = require("./slack_constants");

const csvPath = "/var/lib/files/openpowerlifting-latest.csv";
const zipPath = "/var/lib/files/openpowerlifting-latest.zip";
const openPLurl =
  "https://openpowerlifting.gitlab.io/opl-csv/files/openpowerlifting-latest.zip";

const pool = new Pool({
  user: process.env.DB_POSTGRES_USER,
  host: process.env.DB_POSTGRES_HOST,
  database: process.env.DB_POSTGRES_DATABASE,
  password: process.env.DB_POSTGRES_PASSWORD,
  port: process.env.DB_POSTGRES_PORT,
});

const testDataSingle = [
  {
    name: "Roy Lotzwik",
    date: "22.09.2019",
    meetname: "BW Meisterschaften 2019",
    division: "Juniors",
    weightclasskg: "93 kg",
    bodyweightkg: "93 kg",
    place: "2",
    dots: "500",
    best3squatkg: "255 kg",
    best3benchkg: "157,5 kg",
    best3deadliftkg: "262,5 kg",
    totalkg: "675 kg",
  },
];
const testDataMultiple = [{}, {}];
const testDataMany = [{}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}];

//----------------------------------------------------------------
// Private functions
//----------------------------------------------------------------
function unzipFolder() {
  fs.createReadStream(zipPath)
    .pipe(unzip.Parse())
    .on("entry", (entry) => {
      if (entry.type == "File" && entry.path.endsWith(".csv")) {
        //exclude Folders and the .txt Files
        entry.pipe(fs.createWriteStream(csvPath)); //CSV found --> save to system
      } else {
        entry.autodrain(); //leave the ones we don't need
      }
    })
    .on("finish", () => {
      fs.unlink(zipPath, (err) => {
        if (err) {
          console.log(err);
        }
      }); // delete ZIP
      updateDatabase();
      console.log("Unzip finished, Zip deleted");
    });
}

function downloadZip() {
  https
    .get(openPLurl, function (response) {
      switch (response.statusCode) {
        case 200:
          let file = fs.createWriteStream(zipPath); //save file
          response
            .on("data", function (chunk) {
              file.write(chunk);
            })
            .on("end", function () {
              file.end();
              unzipFolder(zipPath); //downloading done -> extract data
              console.log("Download of Zip finished");
            });
          break;
        default:
          console.log("An Error occured while downloading");
      }
    })
    .on("error", (err) => {
      console.log("An Error occured while downloading");
    });
}

function updateDatabase() {
  console.log("Database query started");

  let query =
    "CREATE TEMP TABLE lifterdata_csv_temp ON COMMIT DROP " +
    "AS SELECT * FROM public.lifterdata_csv WITH NO DATA;" +
    "COPY lifterdata_csv_temp (name, sex, event, equipment, age, ageclass, birthyearclass, division, bodyweightkg, weightclasskg, squat1kg, squat2kg, squat3kg, squat4kg, best3squatkg, bench1kg, bench2kg, bench3kg, bench4kg, best3benchkg, deadlift1kg, deadlift2kg, deadlift3kg, deadlift4kg, best3deadliftkg, totalkg, place, dots, wilks, glossbrenner, goodlift, tested, country, state, federation, parentfederation, date, meetcountry, meetstate, meettown, meetname) " +
    `FROM '${csvPath}'` +
    "DELIMITER ',' CSV HEADER QUOTE '\"' " +
    "ESCAPE '''' FORCE NOT NULL bodyweightkg, totalkg, division;" +
    "TRUNCATE public.lifterdata_csv;" +
    "INSERT INTO public.lifterdata_csv " +
    "SELECT * FROM lifterdata_csv_temp ON CONFLICT DO NOTHING;";

  pool.query(query, (err, res) => {
    if (err) {
      console.log("Error in Database query");
      console.log(err.stack);
    } else {
      console.log("Database updated!");
      console.log(res?.[4]); //only log the insert
    }
    fs.unlink(csvPath, (err) => {
      if (err) {
        console.log(err);
      }
    }); // delete CSV
    console.log("CSV deleted");
  });
}

function buildNamePattern(name) {
  return `%${name.split(" ").join("%")}%`;
}

function getTestData(person) {
  if (person == "") return [];

  let nameArr = person.split(" ");
  if (nameArr.length == 1) return testDataMany;
  if (nameArr.length == 2) return testDataMultiple;

  return testDataSingle;
}

//----------------------------------------------------------------
// Public functions
//----------------------------------------------------------------
function selectLastMeet(person) {
  if (process.env.NODE_ENV == "test") return { rows: getTestData(person) };

  let query =
    "SELECT DISTINCT ON (name) name, date, meetname, division, weightclasskg, bodyweightkg, place, dots, best3squatkg, best3benchkg, best3deadliftkg, totalkg " +
    "FROM public.lifterdata_csv " +
    `WHERE name LIKE '${buildNamePattern(person)}' ` +
    "ORDER BY name ASC, date DESC;";

  return pool.query(query);
}

function selectBestMeet({ person, criteria }) {
  if (process.env.NODE_ENV == "test") return { rows: getTestData(person) };

  let sort = "";

  switch (criteria) {
    case slack_cons.criteriaAbsolute:
      sort += `, totalkg DESC`;
      break;
    case slack_cons.criteriaDots:
      sort += `, dots DESC`;
      break;
    case slack_cons.criteriaWilks:
      sort += `, wilks DESC`;
      break;
  }

  let query =
    "SELECT DISTINCT ON (name) name, date, meetname, division, weightclasskg, bodyweightkg, place, dots, best3squatkg, best3benchkg, best3deadliftkg, totalkg " +
    "FROM public.lifterdata_csv " +
    `WHERE name LIKE '${buildNamePattern(person)}' ` +
    `ORDER BY name ASC${sort};`;

  return pool.query(query);
}

async function selectLifter(name) {
  if (process.env.NODE_ENV == "test") return getTestData(name);

  let query =
    "SELECT DISTINCT ON (name) name, date, meetname, division, weightclasskg, totalkg " +
    "FROM public.lifterdata_csv " +
    `WHERE name LIKE '${buildNamePattern(name)}' ` +
    "ORDER BY name ASC, date DESC;";

  let result = await pool.query(query);
  return result.rows;
}

module.exports = {
  startUpdateDatabase: function () {
    console.log("Database update started");
    downloadZip();
  },
  selectLifter,
  selectLastMeet,
  selectBestMeet,
};
