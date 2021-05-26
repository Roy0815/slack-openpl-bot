//This will be an App that allows Slack users to get Data from openpowerlifting.org directly into the workspace

const { App, ExpressReceiver } = require('@slack/bolt') //, LogLevel
//const bodyParser = require('body-parser')
const { CronJob } = require('cron')
const db_funcs = require('./helpers/database_functions')
const slack_funcs = require('./helpers/slack_functions')

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
    console.log('Get / started')
    res.redirect('https://roylotzwik.de/open-powerlifting-bot-slack/')
})

// Commands
app.command(
    `/${slack_funcs.commandDialog}`,
    async ({ command, ack, client, respond }) => {
        console.log(`command /${slack_funcs.commandDialog} started`)
        await ack()

        try {
            if (command.text.includes('help')) {
                let result = await respond(slack_funcs.getHelpView(command))
                console.log(result.statusText)
            } else {
                let view = slack_funcs.getEntryDialog()
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
    `/${slack_funcs.commandLastmeet}`,
    async ({ command, ack, respond }) => {
        console.log(`command /${slack_funcs.commandLastmeet} started`)
        await ack()

        let users = await db_funcs.selectUsers([command.text])

        if (users.length > 1) {
            console.log(users)
            return
        }

        let { rows } = await db_funcs.selectLastMeet(command.text)
        let retView = slack_funcs.getLastmeetResult('', rows[0])

        respond(retView)
    }
)

app.command(
    `/${slack_funcs.commandBestmeet}`,
    async ({ command, ack, respond }) => {
        console.log(`command /${slack_funcs.commandBestmeet} started`)
        await ack()

        let retView = slack_funcs.getResultMessage(
            command.channel,
            slack_funcs.commandBestmeet
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
    `/${slack_funcs.commandCompare}`,
    async ({ command, ack, respond }) => {
        console.log(`command /${slack_funcs.commandCompare} started`)
        await ack()

        let retView = await slack_funcs.getCompareResult(command)
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
    `/${slack_funcs.commandMeetlink}`,
    async ({ command, ack, respond }) => {
        console.log(`command /${slack_funcs.commandMeetlink} started`)
        await ack()

        try {
            let result = await respond({
                text: `Here is the link to the meet that <@${
                    command.user_id
                }> requested: ${slack_funcs.getMeetLink()}`,
                response_type: 'in_channel'
            })
            console.log(result.statusText)
        } catch (error) {
            console.log(error)
        }
    }
)

app.command(
    `/${slack_funcs.commandRanking}`,
    async ({ command, ack, respond }) => {
        console.log(`command /${slack_funcs.commandRanking} started`)
        await ack()

        try {
            // prettier-ignore
            let result = await respond({
                text: `Here is the link to the ranking that <@${command.user_id}> requested: ${slack_funcs.getRankingLink()}`,
                response_type: 'in_channel'
            })
            console.log(result.statusText)
        } catch (error) {
            console.log(error)
        }
    }
)

app.command('/helloworld', async ({ command, ack, client, respond }) => {
    console.log('/helloworld started')
    await ack()

    let users = await db_funcs.selectUsers([command.text])

    if (users.length > 1) {
        //dialog
        return
    }

    let { rows } = await db_funcs.selectLastMeet(command.text)
    let retView = slack_funcs.getLastmeetResult('', rows[0])

    respond(retView)
})

//events
app.event('app_home_opened', async ({ event, client }) => {
    console.log('event app_home_opened started')

    let view = slack_funcs.homeView
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
        let entryMessageView = slack_funcs.entryMessageView

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
    let view = slack_funcs.getEntryDialog()
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
    let view = slack_funcs.getEntryDialog(body.actions[0].selected_option.value)
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

    let retView = slack_funcs.getResultMessage(channel, option)

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
