//This will be an App that allows Slack users to get Data from openpowerlifting.org directly into the workspace
import { App, BlockAction, StaticSelectAction } from "@slack/bolt";
import * as db_funcs from "./helpers/database_functions.js";
import * as slack_funcs from "./helpers/slack_functions.js";
import * as slack_cons from "./helpers/slack_constants.js";
import * as slack_views from "./helpers/slack_views.js";
import { OpenplError, CommandSubmissionError } from "./helpers/errors.js";
import * as openpl_types from "./helpers/types.js";

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
      return;
    }

    const view = slack_funcs.getEntryDialog({
      channel: undefined,
      subviewName: undefined,
      thread_ts: undefined,
    });
    view.trigger_id = command.trigger_id;

    await client.views.open(view);
  }
);

// all functional commands
app.command(
  slack_cons.regexFunctionalCommands,
  async ({ command, ack, respond, client }) => {
    await ack();

    let openPlCommand = command.command.slice(1);

    try {
      slack_funcs.validateTextForCommand({
        command: openPlCommand,
        text: command.text,
      });
      await respond(slack_cons.messagePendingResult);
    } catch (error) {
      if (error instanceof CommandSubmissionError) {
        await respond(error.toString());
        return;
      }

      throw error;
    }

    try {
      const message = await slack_funcs.getResultMessage({
        command: openPlCommand,
        channel: command.channel_id,
        text: command.text,
        thread_ts: undefined,
      });
      await client.chat.postMessage(message);
    } catch (error) {
      if (!(error instanceof OpenplError)) throw error;

      await client.chat.postEphemeral({
        channel: command.channel_id,
        user: command.user_id,
        text: error.toString(),
      });
    }
  }
);

app.command("/update_database", async ({ ack, respond, command, client }) => {
  await ack();

  if (command.user_id != process.env.ADMIN) {
    respond("Only admins are allowed to use this command");
    return;
  }

  let dbUpdater = new db_funcs.DatabaseUpdater(command.user_id, client);
  dbUpdater.startUpdate();
  respond("Database update started");
});

app.command("/helloworld", async ({ command, ack, client, respond }) => {
  await ack();
});

//******************** Actions ********************//
app.action<BlockAction>("entrymessage_start", async ({ body, client, ack }) => {
  await ack();
  const view = slack_funcs.getEntryDialog({
    thread_ts: body.container.thread_ts,
    channel: body.channel?.id,
    subviewName: undefined,
  });
  view.trigger_id = body.trigger_id;

  await client.views.open(view);
});

app.action("entrymessage_cancel", async ({ respond, ack }) => {
  await ack();
  await respond({
    delete_original: true,
  });
});

app.action<BlockAction>(
  slack_cons.actionEntryDialogRadioButtons,
  async ({ ack, body, client }) => {
    await ack();
    let thread: openpl_types.ThreadInfo = {} as openpl_types.ThreadInfo;

    if (
      body.view &&
      body.view.private_metadata &&
      body.view.private_metadata !== ""
    )
      thread = JSON.parse(body.view.private_metadata);

    const view = slack_funcs.getEntryDialog({
      subviewName: (body?.actions?.[0] as StaticSelectAction)?.selected_option
        .value,
      channel: thread.channel,
      thread_ts: thread.thread_ts,
    });

    view.view_id = body.view?.id;
    await client.views.update(view);
  }
);

// handle remaining actions
app.action(new RegExp(`.*`), async ({ ack }) => {
  try {
    await ack();
  } catch (error) {} //ReceiverMultipleAckError
});

//******************** View Submissions ********************//
app.view(slack_cons.viewNameEntryDialog, async ({ body, ack, client }) => {
  let infoObj;
  let thread: openpl_types.ThreadInfo = {} as openpl_types.ThreadInfo;

  if (body.view.private_metadata && body.view.private_metadata !== "")
    thread = JSON.parse(body.view.private_metadata);

  try {
    infoObj = slack_funcs.getDetailsFromDialog(body);
  } catch (error) {
    if (error instanceof CommandSubmissionError) {
      await ack(error.toViewResponseObject());
      return;
    }

    throw error;
  }

  await ack();

  const channel: string =
    body.view.state.values[slack_cons.blockEntryDialogConversationSelect][
      slack_cons.actionEntryDialogConversationSelect
    ].selected_conversation || "";

  try {
    //pending message
    await client.chat.postEphemeral({
      channel: channel,
      user: body.user.id,
      text: slack_cons.messagePendingResult,
      thread_ts: thread.channel === channel ? thread.thread_ts : undefined,
    });

    //result message
    const message = await slack_funcs.getResultMessage(infoObj);
    await client.chat.postMessage(message);
  } catch (error) {
    //error on server
    if (!(error instanceof OpenplError)) throw error;

    //error to user
    await client.chat.postEphemeral({
      channel: channel,
      user: body.user.id,
      text: error.toString(),
    });
  }
});

//******************** Events ********************//
app.event("app_home_opened", async ({ event, client }) => {
  const view = JSON.parse(JSON.stringify(slack_views.homeView));
  view.user_id = event.user;

  await client.views.publish(view);
});

app.event("app_mention", async ({ event, client }) => {
  await client.chat.postEphemeral(slack_funcs.getEntryMessage(event));
});

//******************** Errors ********************//
/* app.error(async ({ error, context, body, client }) => {
  //TODO: not working yet
  //catch server reponse time: notify user
  if (body.command && error.data.error == "expired_trigger_id") {
    await client.chat.postMessage({
      channel: body.user_id,
      text: `Deine Aktion ${body.command} konnte leider vom Server nicht rechtzeitig verarbeitet werden. Bitte versuche es einfach nochmal. Sorry für die Umstände!`,
    });
  }

  console.error(error);
}); */

//start the app
(async () => {
  await app.start(Number(process.env.APP_PORT) || 8080);
  console.log("Slack OpenPL App listening on Port " + process.env.APP_PORT);
})();
