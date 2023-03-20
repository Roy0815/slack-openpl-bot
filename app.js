//This will be an App that allows Slack users to get Data from openpowerlifting.org directly into the workspace
const { App } = require("@slack/bolt");
const db_funcs = require("./helpers/database_functions");
const slack_funcs = require("./helpers/slack_functions");
const slack_cons = require("./helpers/slack_constants");
const { OpenplError, CommandSubmissionError } = require("./helpers/errors");

// Create Bolt App
const app = new App({
  token: process.env.SLACK_BOT_TOKEN,
  signingSecret: process.env.SLACK_SIGNING_SECRET,
  extendedErrorHandler: true,
});

//******************** Commands ********************//
app.command(
  `/${slack_cons.commandDialog}`,
  async ({ command, ack, client, respond }) => {
    await ack();

    if (command.text.includes("help")) {
      await respond(slack_funcs.getHelpView(command));
    } else {
      let view = slack_funcs.getEntryDialog();
      view.trigger_id = command.trigger_id;

      await client.views.open(view);
    }
  }
);

// all functional commands
app.command(
  new RegExp(
    `^/(${slack_cons.commandLastmeet})?(${slack_cons.commandBestmeet})?(${slack_cons.commandCompare})?(${slack_cons.commandMeetlink})?(${slack_cons.commandRanking})?$`
  ),
  async ({ command, ack, respond, client }) => {
    await ack();

    let openPlCommand = command.command.slice(1);

    try {
      slack_funcs.validateTextForCommand({
        command: openPlCommand,
        text: command.text,
      });
      await respond(slack_cons.messagePendingResult);
    } catch (e) {
      if (!e instanceof CommandSubmissionError) {
        throw e;
      }
      await respond(e.toString());
      return;
    }

    try {
      await client.chat.postMessage(
        await slack_funcs.getResultMessage({
          command: openPlCommand,
          channel: command.channel_id,
          text: command.text,
        })
      );
    } catch (e) {
      if (!e instanceof OpenplError) throw e;

      await client.chat.postEphemeral({
        channel: command.channel_id,
        user: command.user_id,
        text: e.toString(),
      });
    }
  }
);

app.command("/update_database", async ({ ack, respond }) => {
  await ack();

  db_funcs.startUpdateDatabase();

  respond("Database update started");
});

app.command("/helloworld", async ({ command, ack, client, respond }) => {
  await ack();
});

//******************** Actions ********************//
app.action("entrymessage_start", async ({ body, client, ack }) => {
  await ack();
  let view = slack_funcs.getEntryDialog();
  view.trigger_id = body.trigger_id;

  await client.views.open(view);
});

app.action("entrymessage_cancel", async ({ respond, ack }) => {
  await ack();

  await respond({
    delete_original: true,
  });
});

app.action(
  slack_cons.actionEntryDialogRadioButtons,
  async ({ ack, body, client }) => {
    await ack();
    let view = slack_funcs.getEntryDialog(
      body.actions[0].selected_option.value
    );
    view.view_id = body.view.id;

    await client.views.update(view);
  }
);

// handle remaining actions
app.action(new RegExp(`.*`), async ({ body, ack }) => {
  try {
    await ack();
  } catch (err) {} //ReceiverMultipleAckError
});

//******************** View Submissions ********************//
app.view(slack_cons.viewNameEntryDialog, async ({ body, ack, client }) => {
  let infoObj;

  try {
    infoObj = slack_funcs.getDetailsFromDialog(body);
  } catch (e) {
    if (!e instanceof CommandSubmissionError) {
      throw e;
    }
    await ack(e.toSlackResponseObject());
    return;
  }

  await ack();

  let channel =
    body.view.state.values[slack_cons.blockEntryDialogConversationSelect][
      slack_cons.actionEntryDialogConversationSelect
    ].selected_conversation;

  try {
    //pending message
    await client.chat.postEphemeral({
      channel: channel,
      user: body.user.id,
      text: slack_cons.messagePendingResult,
    });

    //result message
    await client.chat.postMessage(await slack_funcs.getResultMessage(infoObj));
  } catch (e) {
    //error on server
    if (!e instanceof OpenplError) {
      throw e;
    }

    //error to user
    await client.chat.postEphemeral({
      channel: channel,
      user: body.user.id,
      text: e.toString(),
    });
  }
});

//******************** Events ********************//
app.event("app_home_opened", async ({ event, client }) => {
  let view = slack_funcs.homeView;
  view.user_id = event.user;

  await client.views.publish(view);
});

app.event("app_mention", async ({ event, client }) => {
  await client.chat.postEphemeral(slack_funcs.getEntryMessage(event));
});

//******************** Errors ********************//
app.error(async ({ error, context, body }) => {
  //catch server reponse time: notify user
  if (body.command && error.data.error == "expired_trigger_id") {
    await client.chat.postMessage({
      channel: body.user_id,
      text: `Deine Aktion ${body.command} konnte leider vom Server nicht rechtzeitig verarbeitet werden. Bitte versuche es einfach nochmal. Sorry für die Umstände!`,
    });
  }

  //log error
  console.log(error);
});

//start the app
(async () => {
  await app.start(process.env.APP_PORT || 8080);
  console.log("Slack OpenPL App listening on Port " + process.env.APP_PORT);
})();
