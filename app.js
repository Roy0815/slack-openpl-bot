//This will be an App that allows Slack users to get Data from openpowerlifting.org directly into the workspace

const express = require('express')
const bodyParser = require('body-parser')
const { CronJob } = require('cron')
const db_helper = require('./database_functions/database_helper.js')

const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.get('/', (req, res) => {
    console.log("Get /");
    res.writeHead(301, {Location: 'https://roylotzwik.de/open-powerlifting-bot-slack/'});
    res.end();
})

app.post('/', (req, res) => {
    console.log("Post /");
    if (req.body) console.log(req.body)

    if (req.body?.challenge && req.body?.type == "url_verification") {
        return res.send(req.body.challenge)
    }

    res.sendStatus(200);
})

app.listen(8080,'0.0.0.0')
console.log('Slack OpenPL App listening on: 0.0.0.0:8080')

const job = new CronJob('59 23 * * 0', db_helper.startUpdateDatabase())
console.log('Database update Job started for Sundays 11.59 p.m.')