//This will be an App that allows Slack users to get Data from openpowerlifting.org directly into the workspace

const { App, ExpressReceiver } = require('@slack/bolt') //, LogLevel
//const bodyParser = require('body-parser')
const { CronJob } = require('cron')
const db_helper = require('./database_functions/database_helper')
const slack_helper = require('./slack_functions/slack_helper')

// Create receiver
const receiver = new ExpressReceiver({ signingSecret: process.env.SLACK_SIGNING_SECRET });

// Create Bolt App
const app = new App({
    token: process.env.SLACK_BOT_TOKEN,
    receiver//,
    //logLevel: LogLevel.DEBUG
});

//get URL
receiver.router.get('/', (req, res) => {
    console.log("Get /");
    res.redirect('https://roylotzwik.de');
});

// Commands
app.command('/meetlookup', async ({ command, ack, client }) => {
    console.log("/meetlookup started");
    try{
        await ack();
        let view = slack_helper.getEntryDialog();
        view.trigger_id = command.trigger_id;
        let result = await client.views.open(view);
        if (result.ok) console.log('ok'); else console.log('not ok');
    } catch (error) {
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
        if (result.ok) console.log('ok'); else console.log('not ok');
    } catch (error) {
        console.log(error);
    }
});

//actions
app.action('entrymessage_start', async ({ body , client , ack }) => {
    console.log("action entrymessage_start started");
    await ack();
    let view = slack_helper.getEntryDialog();
    view.trigger_id = body.trigger_id;

    try {
        let result = await client.views.open(view);
        if (result.ok) console.log('ok'); else console.log('not ok');
    } catch (error) {
        console.error(error);
    }
});

app.action('entrymessage_cancel', async ({ respond , ack }) => {
    console.log("Action entrymessage_cancel started");
    try{
        await ack();
        await respond({
            //text: "Action cancelled",
            delete_original: true
            //replace_original: true
        });
    } catch (error) {
        console.log(error);
    }
});

app.action('entrydialog_radiobuttons', async ({ ack, body, client }) => {
    console.log("action entrydialog_radiobuttons started");
    await ack();
    let view = slack_helper.getEntryDialog(body.actions[0].selected_option.value);
    view.view_id = body.view.id;

    try {
        let result = await client.views.update(view);
        if (result.ok) console.log('ok'); else console.log('not ok');
    } catch (error) {
        console.error(error);
    }
});

app.action('bestmeet_criteria_input', async ({ ack }) => {
    console.log("action bestmeet_criteria_input started");
    await ack();
});

app.action('top10_comparemethod_input', async ({ ack }) => {
    console.log("action top10_comparemethod_input started");
    await ack();
});

app.action('top10_gender_input', async ({ ack }) => {
    console.log("action top10_gender_input started");
    await ack();
});

app.action('top10_tested_input', async ({ ack }) => {
    console.log("action top10_tested_input started");
    await ack();
});

app.action('compare_criteria_input', async ({ ack }) => {
    console.log("action compare_criteria_input started");
    await ack();
});

//view submissions
app.view('entrydialog', async ({ ack, body, view, client }) => {
    await ack();
    console.log(view['state']['values']['entrydialog_radiobuttons'].entrydialog_radiobuttons.selected_option.value);
});

//start the app
(async () => {
    await app.start(process.env.APP_PORT);
    console.log('Slack OpenPL App listening on Port ' + process.env.APP_PORT)
})();

//const job = new CronJob('59 23 * * 0', db_helper.startUpdateDatabase())
//job.start()
console.log('Database update Job started for Sundays 11.59 p.m.');