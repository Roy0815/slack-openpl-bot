// file with all functions for database read/ write actions
import fs from "fs";
import unzip from "unzip-stream";
import https from "https";
import http from "http";
import { Pool } from "pg";
import * as slack_cons from "./slack_constants.js";
import { WebClient } from "@slack/web-api";
import { BufferedIncomingMessage } from "@slack/bolt";
import { Criteria, Person, PersonShort } from "./types.js";

const pool = new Pool({
  user: process.env.DB_POSTGRES_USER,
  host: process.env.DB_POSTGRES_HOST,
  database: process.env.DB_POSTGRES_DATABASE,
  password: process.env.DB_POSTGRES_PASSWORD,
  port: Number(process.env.DB_POSTGRES_PORT),
});

const testDataSingle: Person[] = [
  {
    name: "Roy Lotzwik",
    date: new Date(),
    meetname: "BW Meisterschaften 2019",
    division: "Juniors",
    weightclasskg: "93 kg",
    bodyweightkg: "93 kg",
    place: "2",
    dots: 500,
    best3squatkg: 255,
    best3benchkg: 157.5,
    best3deadliftkg: 262.5,
    totalkg: 675,
  },
];
const testDataMultiple: Person[] = [
  testDataSingle[0],
  {
    name: "Simon Daniel Oswald",
    date: new Date(),
    meetname: "DM Kraftdreikampf Equipped/Classic - Aktive",
    division: "Open",
    weightclasskg: "105 kg",
    bodyweightkg: "103 kg",
    place: "17",
    dots: 411.74,
    best3squatkg: 230,
    best3benchkg: 152.5,
    best3deadliftkg: 295,
    totalkg: 677.5,
  },
];
const testDataMany: Person[] = [
  testDataMultiple[0],
  testDataMultiple[1],
  testDataMultiple[0],
  testDataMultiple[1],
  testDataMultiple[0],
  testDataMultiple[1],
  testDataMultiple[0],
  testDataMultiple[1],
  testDataMultiple[0],
  testDataMultiple[1],
];

//----------------------------------------------------------------
// Private section
//----------------------------------------------------------------
function buildNamePattern(name: string) {
  return `%${name.split(" ").join("%")}%`;
}

function getTestData(name: string): Person[] {
  if (name == "") return [];

  let nameArr = name.split(" ");
  if (nameArr.length == 1) return testDataMany;
  if (nameArr.length == 2) return testDataMultiple;

  return testDataSingle;
}

//----------------------------------------------------------------
// Public section
//----------------------------------------------------------------
export class DatabaseUpdater {
  private _user: string;
  private _client: WebClient;

  private _csvPath = "/var/lib/files/openpowerlifting-latest.csv" as const;
  private _zipPath = "/var/lib/files/openpowerlifting-latest.zip" as const;
  private _openPLurl =
    "https://openpowerlifting.gitlab.io/opl-csv/files/openpowerlifting-latest.zip" as const;

  constructor(user: string, client: WebClient) {
    this._user = user;
    this._client = client;
  }

  private async messageUser(message: string) {
    console.log(message);
    if (this._user && this._client)
      this._client.chat.postMessage({
        channel: this._user,
        text: message,
      });
  }

  async startUpdate(): Promise<void> {
    console.log("Database update started");

    await this.downloadZip();
  }

  private async downloadZip(): Promise<void> {
    let _this = this;

    https
      .get(this._openPLurl, function (response) {
        switch (response.statusCode) {
          case 200:
            let file = fs.createWriteStream(_this._zipPath); //save file
            response
              .on("data", function (chunk) {
                file.write(chunk);
              })
              .on("end", function () {
                file.end();
                _this.messageUser("Download of Zip finished");
                _this.unzipFolder();
              });
            break;
          default:
            _this.messageUser(
              `Response Code ${response.statusCode} occured while downloading`
            );
        }
      })
      .on("error", (err) => {
        console.log(err);
        this.messageUser("An Error occured while downloading");
      });
  }

  private async unzipFolder(): Promise<void> {
    fs.createReadStream(this._zipPath)
      .pipe(unzip.Parse())
      .on("entry", (entry) => {
        if (entry.type === "File" && entry.path.endsWith(".csv")) {
          //exclude Folders and the .txt Files
          entry.pipe(fs.createWriteStream(this._csvPath)); //CSV found --> save to system
        } else {
          entry.autodrain(); //leave the ones we don't need
        }
      })
      .on("finish", async () => {
        fs.unlink(this._zipPath, (err) => {
          if (err) {
            console.log(err);
          }
        }); // delete ZIP
        this.updateDatabase();
        await this.messageUser("Unzip finished, Zip deleted");
      });
  }

  private async updateDatabase(): Promise<void> {
    let query =
      //create temp table
      "CREATE TEMP TABLE lifterdata_csv_temp ON COMMIT DROP " +
      "AS SELECT * FROM public.lifterdata_csv WITH NO DATA;" +
      // modify total column to character
      "ALTER TABLE lifterdata_csv_temp ALTER COLUMN totalkg TYPE character(8);" +
      //read csv
      "COPY lifterdata_csv_temp (name, sex, event, equipment, age, ageclass, birthyearclass, division, bodyweightkg, weightclasskg, squat1kg, squat2kg, squat3kg, squat4kg, best3squatkg, bench1kg, bench2kg, bench3kg, bench4kg, best3benchkg, deadlift1kg, deadlift2kg, deadlift3kg, deadlift4kg, best3deadliftkg, totalkg, place, dots, wilks, glossbrenner, goodlift, tested, country, state, federation, parentfederation, date, meetcountry, meetstate, meettown, meetname) " +
      `FROM '${this._csvPath}'` +
      "WITH DELIMITER ',' CSV HEADER QUOTE '\"' " +
      "ESCAPE '''' FORCE NOT NULL bodyweightkg, totalkg, division, equipment;" +
      //fix empty totals
      "UPDATE lifterdata_csv_temp SET totalkg = 0 WHERE totalkg = ' '; " +
      //restore column type
      "ALTER TABLE lifterdata_csv_temp ALTER COLUMN totalkg TYPE numeric(5,1) USING totalkg::numeric(5,1); " +
      //delete live table
      "TRUNCATE public.lifterdata_csv;" +
      //insert new entries
      "INSERT INTO public.lifterdata_csv " +
      "SELECT * FROM lifterdata_csv_temp ON CONFLICT DO NOTHING;";

    pool.query(query, (err, res) => {
      if (err) {
        this.messageUser(`Error in Database query\n${err.stack}`);
      } else {
        this.messageUser("Database query started");
      }
      fs.unlink(this._csvPath, (err) => {
        if (err) {
          console.log(err);
        }
      }); // delete CSV
      this.messageUser("CSV deleted");
    });
  }
}

export function selectLastMeet(name: string) {
  if (process.env.NODE_ENV == "test") return { rows: getTestData(name) };

  let text =
    "SELECT DISTINCT ON (name) name, date, meetname, division, weightclasskg, bodyweightkg, place, dots, best3squatkg, best3benchkg, best3deadliftkg, totalkg " +
    "FROM public.lifterdata_csv " +
    `WHERE name LIKE $1 ` +
    "ORDER BY name ASC, date DESC;";

  let values = [buildNamePattern(name)];

  return pool.query(text, values);
}

export async function selectBestMeet(
  name: string,
  criteria: Criteria
): Promise<Person[]> {
  if (process.env.NODE_ENV == "test") return getTestData(name);

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

  let text =
    "SELECT DISTINCT ON (name) name, date, meetname, division, weightclasskg, bodyweightkg, place, dots, best3squatkg, best3benchkg, best3deadliftkg, totalkg " +
    "FROM public.lifterdata_csv " +
    `WHERE name LIKE $1 ` +
    `ORDER BY name ASC${sort};`;

  let values = [buildNamePattern(name)];

  return (await pool.query(text, values)).rows;
}

export async function selectLifter(name: string): Promise<PersonShort[]> {
  if (process.env.NODE_ENV == "test") return getTestData(name);

  let text =
    "SELECT DISTINCT ON (name) name, date, meetname, division, weightclasskg, totalkg " +
    "FROM public.lifterdata_csv " +
    `WHERE name LIKE $1 ` +
    "ORDER BY name ASC, date DESC;";

  let values = [buildNamePattern(name)];

  return (await pool.query(text, values)).rows;
}
