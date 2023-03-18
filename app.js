//This will be an App that allows Slack users to get Data from openpowerlifting.org directly into the workspace
const { App } = require("@slack/bolt");
const db_funcs = require("./helpers/database_functions");
const slack_funcs = require("./helpers/slack_functions");
const slack_cons = require("./helpers/slack_constants");
const { OpenplError } = require("./helpers/errors");

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
    console.log(`command /${slack_cons.commandDialog} started`);
    await ack();

    try {
      if (command.text.includes("help")) {
        let result = await respond(slack_funcs.getHelpView(command));
        console.log(result.statusText);
      } else {
        let view = slack_funcs.getEntryDialog();
        view.trigger_id = command.trigger_id;

        let result = await client.views.open(view);
        console.log(result.ok ? "ok" : "not ok");
      }
    } catch (error) {
      console.log(error);
    }
  }
);

app.command(
  `/${slack_cons.commandLastmeet}`,
  async ({ command, ack, respond, client }) => {
    console.log(`command /${slack_cons.commandLastmeet} started`);
    await ack();

    await respond(`User lookup started for *${command.text}*`);

    try {
      await client.chat.postMessage(
        await slack_funcs.getResultMessage({
          command: slack_cons.commandLastmeet,
          channel: command.channel_id,
          text: command.text,
        })
      );
    } catch (e) {
      if (!e instanceof OpenplError) return;

      await client.chat.postEphemeral({
        channel: command.channel_id,
        user: command.user_id,
        text: e.toString(),
      });
    }
  }
);

app.command(
  `/${slack_cons.commandBestmeet}`,
  async ({ command, ack, respond }) => {
    console.log(`command /${slack_cons.commandBestmeet} started`);
    await ack();

    let retView = slack_funcs.getResultMessage(
      command.channel,
      slack_cons.commandBestmeet
    );
    retView.response_type = "in_channel";

    try {
      let result = await respond(retView);
      console.log(result.statusText);
    } catch (error) {
      console.log(error);
    }
  }
);

app.command(
  `/${slack_cons.commandCompare}`,
  async ({ command, ack, respond }) => {
    console.log(`command /${slack_cons.commandCompare} started`);
    await ack();

    let retView = await slack_funcs.getCompareResult(command);
    retView.response_type = "in_channel";

    try {
      let result = await respond(retView);
      console.log(result.statusText);
    } catch (error) {
      console.log(error);
    }
  }
);

app.command(
  `/${slack_cons.commandMeetlink}`,
  async ({ command, ack, respond }) => {
    console.log(`command /${slack_cons.commandMeetlink} started`);
    await ack();

    try {
      let result = await respond({
        text: `Here is the link to the meet that <@${
          command.user_id
        }> requested: ${slack_funcs.getMeetLink()}`,
        response_type: "in_channel",
      });
      console.log(result.statusText);
    } catch (error) {
      console.log(error);
    }
  }
);

app.command(
  `/${slack_cons.commandRanking}`,
  async ({ command, ack, respond }) => {
    console.log(`command /${slack_cons.commandRanking} started`);
    await ack();

    try {
      // prettier-ignore
      let result = await respond({
                text: `Here is the link to the ranking that <@${command.user_id}> requested: ${slack_funcs.getRankingLink()}`,
                response_type: 'in_channel'
            })
      console.log(result.statusText);
    } catch (error) {
      console.log(error);
    }
  }
);

app.command("/update_database", async ({ ack, respond }) => {
  console.log("/update_database");
  await ack();

  db_funcs.startUpdateDatabase();

  respond("Database update started");
});

app.command("/helloworld", async ({ command, ack, client, respond }) => {
  console.log("/helloworld started");
  await ack();

  let users = await db_funcs.selectUsers([command.text]);

  if (users.length > 1) {
    //dialog
    return;
  }

  let { rows } = await db_funcs.selectLastMeet(command.text);
  let retView = slack_funcs.getLastmeetResult("", rows[0]);

  respond(retView);
});

//******************** Actions ********************//
app.action("entrymessage_start", async ({ body, client, ack }) => {
  console.log("action entrymessage_start started");
  await ack();
  let view = slack_funcs.getEntryDialog();
  view.trigger_id = body.trigger_id;

  try {
    let result = await client.views.open(view);
    console.log(result.ok ? "ok" : "not ok");
  } catch (error) {
    console.error(error);
  }
});

app.action("entrymessage_cancel", async ({ respond, ack }) => {
  console.log("Action entrymessage_cancel started");
  await ack();

  try {
    await respond({
      delete_original: true,
    });
  } catch (error) {
    console.log(error);
  }
});

app.action("entrydialog_radiobuttons", async ({ ack, body, client }) => {
  console.log("action entrydialog_radiobuttons started");
  await ack();
  let view = slack_funcs.getEntryDialog(body.actions[0].selected_option.value);
  view.view_id = body.view.id;

  try {
    let result = await client.views.update(view);
    console.log(result.ok ? "ok" : "not ok");
  } catch (error) {
    console.error(error);
  }
});

// handle remaining actions
app.action(new RegExp(`.*`), async ({ body, ack }) => {
  try {
    await ack();
    if (body && body.actions && body.actions.length > 0)
      console.log(`Action: ${body.actions[0].action_id}`);
  } catch (err) {} //ReceiverMultipleAckError
});

//******************** View Submissions ********************//
app.view(slack_cons.viewNameEntryDialog, async ({ body, ack, client }) => {
  console.log("View entrydialog submitted");
  await ack();

  if (
    !body.view.state.values[slack_cons.blockEntryDialogRadioButtons][
      slack_cons.actionEntryDialogRadioButtons
    ].selected_option
  )
    return; //nothing selected

  let option =
    body.view.state.values[slack_cons.blockEntryDialogRadioButtons][
      slack_cons.actionEntryDialogRadioButtons
    ].selected_option.value;

  let channel =
    body.view.state.values[slack_cons.blockEntryDialogConversationSelect][
      slack_cons.actionEntryDialogConversationSelect
    ].selected_conversation;

  //get text from options here
  console.log(body);

  try {
    let result = await client.chat.postMessage(
      await slack_funcs.getResultMessage({
        command: option,
        text: "",
        channel: channel,
      })
    );
    console.log(result.ok ? "ok" : "not ok");
  } catch (e) {
    if (!e instanceof OpenplError) return;

    await client.chat.postEphemeral({
      channel: channel,
      user: body.user.id,
      text: e.toString(),
    });
  }
});

//******************** Events ********************//
app.event("app_home_opened", async ({ event, client }) => {
  console.log("event app_home_opened started");

  let view = slack_funcs.homeView;
  view.user_id = event.user;

  try {
    let result = await client.views.publish(view);
    console.log(result.ok ? "ok" : "not ok");
  } catch (error) {
    console.error(error);
  }
});

app.event("app_mention", async ({ event, client }) => {
  console.log("event app_mention started");
  try {
    let result = await client.chat.postEphemeral(
      slack_funcs.getEntryMessage(event)
    );
    console.log(result.ok ? "ok" : "not ok");
  } catch (error) {
    console.log(error);
  }
});

//start the app
(async () => {
  await app.start(process.env.APP_PORT || 8080);
  console.log("Slack OpenPL App listening on Port " + process.env.APP_PORT);
})();
