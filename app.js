//This will be an App that allows Slack users to get Data from openpowerlifting.org directly into the workspace

const { App, ExpressReceiver, LogLevel } = require('@slack/bolt')
//const bodyParser = require('body-parser')
const { CronJob } = require('cron')
const db_helper = require('./database_functions/database_helper')
const slack_helper = require('./slack_functions/slack_helper')

// Create receiver
const receiver = new ExpressReceiver({ signingSecret: process.env.SLACK_SIGNING_SECRET });

// Create Bolt App
const app = new App({
    token: process.env.SLACK_BOT_TOKEN,
    receiver,
    logLevel: LogLevel.DEBUG
});

//get URL
receiver.router.get('/', (req, res) => {
    console.log("Get /");
    res.send("test");
});

// Commands
app.command('/lastmeet', async ({ command, ack, client }) => {
    console.log("/latestmeet started");
    await ack();
    try{
        let view = slack_helper.entryView;
        view.trigger_id = command.trigger_id;
        let result = await client.views.open(view);
        console.log(result);
    } catch (error) {
        console.log("Error in Command /latestmeet :");
        console.log(error);
    }
});

//events
app.event('app_mention', async ({ event , client  }) => {
    console.log("event app_mention started");
    try{
        let entryMessageView = slack_helper.entryMessageView;

        entryMessageView.channel = event.channel;
        entryMessageView.user = event.user;
        if (event.thread_ts) entryMessageView.thread_ts = event.thread_ts;

        let result = await client.chat.postEphemeral(entryMessageView);
        console.log(result);
    } catch (error) {
        console.log("Error in Event app_mention");
        console.log(error);
    }
});

//actions
app.action('entrymessage_cancel', async ({ respond , ack }) => {
    console.log("action entrymessage_cancel started");
    await ack();
    await respond({
        text: "Action cancelled",
        response_type: "ephemeral",
        replace_original: true
    });
});

(async () => {
    // Start the app
    await app.start(process.env.APP_PORT);
    console.log('Slack OpenPL App listening on Port ' + process.env.APP_PORT)
})();

//const job = new CronJob('59 23 * * 0', db_helper.startUpdateDatabase())
//job.start()
console.log('Database update Job started for Sundays 11.59 p.m.');