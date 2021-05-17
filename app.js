//This will be an App that allows Slack users to get Data from openpowerlifting.org directly into the workspace

const { App, ExpressReceiver } = require('@slack/bolt') //, LogLevel
//const bodyParser = require('body-parser')
const { CronJob } = require('cron')
const db_helper = require('./database_functions/database_helper')
const slack_helper = require('./slack_functions/slack_helper')

// Create receiver
const receiver = new ExpressReceiver({
    signingSecret: process.env.SLACK_SIGNING_SECRET
})

// Create Bolt App
const app = new App({
    token: process.env.SLACK_BOT_TOKEN,
    receiver //,
    //logLevel: LogLevel.DEBUG
})

//get URL
receiver.router.get('/', (req, res) => {
    console.log('Get /')
    res.redirect('https://roylotzwik.de/open-powerlifting-bot-slack/')
})

// Commands
app.command(
    `/${slack_helper.commandDialog}`,
    async ({ command, ack, client, respond }) => {
        console.log(`command /${slack_helper.commandDialog} started`)
        await ack()

        try {
            if (command.text.includes('help')) {
                let result = await respond(slack_helper.helpView)
                console.log(result.statusText)
            } else {
                let view = slack_helper.getEntryDialog()
                view.trigger_id = command.trigger_id

                let result = await client.views.open(view)
                console.log(result.ok ? 'ok' : 'not ok')
            }
        } catch (error) {
            console.log(error)
        }
    }
)

app.command(
    `/${slack_helper.commandLastmeet}`,
    async ({ command, ack, respond }) => {
        console.log(`command /${slack_helper.commandLastmeet} started`)
        await ack()

        let retView = slack_helper.getResultMessage(
            command.channel,
            slack_helper.commandLastmeet
        )
        retView.response_type = 'in_channel'

        try {
            let result = await respond(retView)
            console.log(result.statusText)
        } catch (error) {
            console.log(error)
        }
    }
)

app.command(
    `/${slack_helper.commandBestmeet}`,
    async ({ command, ack, respond }) => {
        console.log(`command /${slack_helper.commandBestmeet} started`)
        await ack()

        let retView = slack_helper.getResultMessage(
            command.channel,
            slack_helper.commandBestmeet
        )
        retView.response_type = 'in_channel'

        try {
            let result = await respond(retView)
            console.log(result.statusText)
        } catch (error) {
            console.log(error)
        }
    }
)

app.command(
    `/${slack_helper.commandCompare}`,
    async ({ command, ack, respond }) => {
        console.log(`command /${slack_helper.commandCompare} started`)
        await ack()

        let retView = slack_helper.getResultMessage(
            command.channel,
            slack_helper.commandCompare
        )
        retView.response_type = 'in_channel'

        try {
            let result = await respond(retView)
            console.log(result.statusText)
        } catch (error) {
            console.log(error)
        }
    }
)

app.command(
    `/${slack_helper.commandMeetlink}`,
    async ({ command, ack, respond }) => {
        console.log(`command /${slack_helper.commandMeetlink} started`)
        await ack()

        try {
            let result = await respond({
                text: `Here is the link to the meet that <@${command.user_id}> requested: <https://www.openpowerlifting.org/m/bvdk/1938|2019 BVDK BWG KDK Classic>`,
                response_type: 'in_channel'
            })
            console.log(result.statusText)
        } catch (error) {
            console.log(error)
        }
    }
)

app.command(
    `/${slack_helper.commandRanking}`,
    async ({ command, ack, respond }) => {
        console.log(`command /${slack_helper.commandRanking} started`)
        await ack()

        try {
            let result = await respond({
                text: `Here is the link to the ranking that <@${command.user_id}> requested: <https://www.openpowerlifting.org/rankings/ipf93/bvdk/men/20-23|-93 kg, men, Juniors, BVDK>`,
                response_type: 'in_channel'
            })
            console.log(result.statusText)
        } catch (error) {
            console.log(error)
        }
    }
)

app.command('/helloworld', async ({ command, ack, client }) => {
    console.log('/helloworld started')

    await ack()
    let view = slack_helper.getEntryDialog()
    view.trigger_id = command.trigger_id

    try {
        let result = await client.views.open(view)
        console.log(result.ok ? 'ok' : 'not ok')
    } catch (error) {
        console.log(error)
    }
})

//events
app.event('app_home_opened', async ({ event, client }) => {
    console.log('event app_home_opened started')

    let view = slack_helper.homeView
    view.user_id = event.user

    try {
        let result = await client.views.publish(view)
        console.log(result.ok ? 'ok' : 'not ok')
    } catch (error) {
        console.error(error)
    }
})

app.event('app_mention', async ({ event, client }) => {
    console.log('event app_mention started')
    try {
        let entryMessageView = slack_helper.entryMessageView

        entryMessageView.channel = event.channel
        entryMessageView.user = event.user
        if (event.thread_ts) entryMessageView.thread_ts = event.thread_ts

        let result = await client.chat.postEphemeral(entryMessageView)
        console.log(result.ok ? 'ok' : 'not ok')
    } catch (error) {
        console.log(error)
    }
})

//actions
app.action('entrymessage_start', async ({ body, client, ack }) => {
    console.log('action entrymessage_start started')
    await ack()
    let view = slack_helper.getEntryDialog()
    view.trigger_id = body.trigger_id

    try {
        let result = await client.views.open(view)
        console.log(result.ok ? 'ok' : 'not ok')
    } catch (error) {
        console.error(error)
    }
})

app.action('entrymessage_cancel', async ({ respond, ack }) => {
    console.log('Action entrymessage_cancel started')
    await ack()

    try {
        await respond({
            delete_original: true
        })
    } catch (error) {
        console.log(error)
    }
})

app.action('entrydialog_radiobuttons', async ({ ack, body, client }) => {
    console.log('action entrydialog_radiobuttons started')
    await ack()
    let view = slack_helper.getEntryDialog(
        body.actions[0].selected_option.value
    )
    view.view_id = body.view.id

    try {
        let result = await client.views.update(view)
        console.log(result.ok ? 'ok' : 'not ok')
    } catch (error) {
        console.error(error)
    }
})

app.action('bestmeet_criteria_input', async ({ ack }) => {
    console.log('action bestmeet_criteria_input started')
    await ack()
})

app.action('top10_comparemethod_input', async ({ ack }) => {
    console.log('action top10_comparemethod_input started')
    await ack()
})

app.action('top10_gender_input', async ({ ack }) => {
    console.log('action top10_gender_input started')
    await ack()
})

app.action('top10_tested_input', async ({ ack }) => {
    console.log('action top10_tested_input started')
    await ack()
})

app.action('compare_criteria_input', async ({ ack }) => {
    console.log('action compare_criteria_input started')
    await ack()
})

app.action('entrydialog_conversations_select', async ({ ack }) => {
    console.log('action entrydialog_conversations_select started')
    await ack()
})

//view submissions
app.view('entrydialog', async ({ body, ack, client, payload }) => {
    console.log('View entrydialog submitted')
    await ack()

    if (
        !body.view.state.values.entrydialog_radiobuttons
            .entrydialog_radiobuttons.selected_option
    )
        return //nothing selected

    let option =
        body.view.state.values.entrydialog_radiobuttons.entrydialog_radiobuttons
            .selected_option.value
    let channel =
        body.view.state.values.entrydialog_conversations_select
            .entrydialog_conversations_select.selected_conversation

    let retView = slack_helper.getResultMessage(channel, option)

    try {
        let result = await client.chat.postMessage(retView)
        console.log(result.ok ? 'ok' : 'not ok')
    } catch (error) {
        console.error(error)
    }
})

//start the app
;(async () => {
    await app.start(process.env.APP_PORT)
    console.log('Slack OpenPL App listening on Port ' + process.env.APP_PORT)
})()
