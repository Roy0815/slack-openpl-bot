import { AppMentionEvent } from "@slack/bolt";

// file with everything for slack interactions
import * as slack_views from "./slack_views.js";
import * as slack_cons from "./slack_constants.js";
import * as db_funcs from "./database_functions.js";
import * as errors from "./errors.js";
import { CommandInfo } from "./types.js";

//----------------------------------------------------------------
// Private functions
//----------------------------------------------------------------
function getPersonLink(name: string): string {
  let linkName = name
    //replace accents/diacritics with their "normal" letter
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    //remove spaces
    .replace(/\s+/g, "")
    //remove # for numbers
    .replace(/#+/g, "")
    .toLowerCase();

  return `https://www.openpowerlifting.org/u/${linkName}`;
}

function formatDate(date: Date): string {
  return `${date.getDate() < 10 ? "0" : ""}${date.getDate()}.${
    date.getMonth() + 1 < 10 ? "0" : ""
  }${date.getMonth() + 1}.${date.getFullYear()}`;
}

function getSingleMeetResultView({ personObj }) {
  let resultMessage = JSON.parse(
    JSON.stringify(slack_views.singlemeetResultMessageView)
  );

  resultMessage.blocks[2].fields[0].text = `*Meet:* ${personObj.meetname}`;
  resultMessage.blocks[2].fields[1].text = `*Date:* ${formatDate(
    personObj.date
  )}`;

  resultMessage.blocks[3].fields[0].text = `*Categorie:* ${personObj.division}`;
  resultMessage.blocks[3].fields[1].text = `*Class:* ${personObj.weightclasskg}`;
  resultMessage.blocks[3].fields[2].text = `*Place:* ${
    personObj.place === 1
      ? "🥇"
      : personObj.place === 2
      ? "🥈"
      : personObj.place === 3
      ? "🥉"
      : personObj.place
  }`;
  resultMessage.blocks[3].fields[3].text = `*Dots:* ${personObj.dots}`;

  resultMessage.blocks[4].fields[0].text = `*Squat:* ${personObj.best3squatkg}`;
  resultMessage.blocks[4].fields[1].text = `*Bench:* ${personObj.best3benchkg}`;
  resultMessage.blocks[4].fields[2].text = `*Deadlift:* ${personObj.best3deadliftkg}`;
  resultMessage.blocks[4].fields[3].text = `*Total:* ${personObj.totalkg}`;

  return resultMessage;
}

async function getLastmeetResult({ person }) {
  //check user exists and is unique
  let users = await db_funcs.selectLifter(person);

  if (users.length > 1) throw new errors.AmbiguousLifterError(users);

  if (users.length === 0) throw new errors.NoLifterFoundError(person);

  //fetch data from database
  let { rows } = await db_funcs.selectLastMeet(person);

  //build view
  let view = getSingleMeetResultView({ personObj: rows[0] });

  view.text = `Last meet of *${rows[0].name}*`; //message preview
  view.blocks[0].text.text = `Last meet of *${rows[0].name}* <${getPersonLink(
    rows[0].name
  )}|openpowerlifting.org>`;

  return view;
}

async function getBestmeetResult({ person, criteria }) {
  //check user exists and is unique
  let users = await db_funcs.selectLifter(person);

  if (users.length > 1) throw new errors.AmbiguousLifterError(users);

  if (users.length === 0) throw new errors.NoLifterFoundError(person);

  //fetch data from database
  let { rows } = await db_funcs.selectBestMeet({ person, criteria });

  //build view
  let view = getSingleMeetResultView({ personObj: rows[0] });

  view.text = `Best meet of *${rows[0].name}*`; //message preview
  view.blocks[0].text.text = `Best meet of *${rows[0].name}* <${getPersonLink(
    rows[0].name
  )}|openpowerlifting.org>`;

  return view;
}

async function getCompareResult(command) {
  let resultMessage = JSON.parse(
    JSON.stringify(slack_views.compareResultMessageView)
  );
  resultMessage.text = `Comparison of ${persons[0].name} and ${persons[1].name}`; //message preview
  resultMessage.blocks[0].text.text = `Comparison of <https://www.openpowerlifting.org/u/roylotzwik|${persons[0].name}> and <https://www.openpowerlifting.org/u/simondanieloswald|${persons[1].name}>`;

  resultMessage.blocks[2].text.text = `*${persons[0].name}* personal best:`;
  resultMessage.blocks[2].fields[0].text = `*Date:* ${persons[0].date}`;
  resultMessage.blocks[2].fields[1].text = `*Bodyweight:* ${persons[0].bodyweightkg} kg`;
  resultMessage.blocks[2].fields[2].text = `*Dots:* ${persons[0].dots}`;
  resultMessage.blocks[2].fields[3].text = `*Total:* ${persons[0].totalkg} kg`;

  resultMessage.blocks[3].fields[0].text = `*Squat:* ${persons[1].best3squatkg} kg`;
  resultMessage.blocks[3].fields[1].text = `*Bench:* ${persons[1].best3benchkg} kg`;
  resultMessage.blocks[3].fields[2].text = `*Deadlift:* ${persons[1].best3deadliftkg} kg`;

  resultMessage.blocks[6].text.text = `*${persons[1].name}* personal best:`;
  resultMessage.blocks[6].fields[0].text = `*Date:* ${persons[1].date}`;
  resultMessage.blocks[6].fields[1].text = `*Bodyweight:* ${persons[1].bodyweightkg} kg`;
  resultMessage.blocks[6].fields[2].text = `*Dots:* ${persons[1].dots}`;
  resultMessage.blocks[6].fields[3].text = `*Total:* ${persons[1].totalkg} kg`;

  resultMessage.blocks[7].fields[0].text = `*Squat:* ${persons[1].best3squatkg} kg`;
  resultMessage.blocks[7].fields[1].text = `*Bench:* ${persons[1].best3benchkg} kg`;
  resultMessage.blocks[7].fields[2].text = `*Deadlift:* ${persons[1].best3deadliftkg} kg`;

  resultMessage.blocks[9].text.text = `*${persons[1].name} wins by 82,5kg Total!*`;
}

function getRankingLink(filters) {
  return "<https://www.openpowerlifting.org/rankings/ipf93/bvdk/men/20-23|-93 kg, men, Juniors, BVDK>";
}

function getMeetLink(meetname) {
  return "<https://www.openpowerlifting.org/m/bvdk/1938|2019 BVDK BWG KDK Classic>";
}

function getCommandTextFromDialog({ command, values }) {
  let text;
  switch (command) {
    case slack_cons.commandLastmeet:
      text =
        values[slack_cons.blockPerson1InputSubView][
          slack_cons.actionPerson1InputSubView
        ].value;
      break;

    case slack_cons.commandBestmeet:
      text = `${
        values[slack_cons.blockPerson1InputSubView][
          slack_cons.actionPerson1InputSubView
        ].value
      };${
        values[slack_cons.blockCriteriaInputSubView][
          slack_cons.actionCriteriaInputSubView
        ].selected_option.value
      }`;
      break;
  }

  validateTextForCommand({ command, text });

  return text;
}

function getInfoObjectFromText({ command, text }): CommandInfo {
  let infoObject = {} as CommandInfo;

  switch (command) {
    case slack_cons.commandLastmeet:
      infoObject.name = text.trim();
      break;

    case slack_cons.commandBestmeet:
      [infoObject.name, infoObject.criteria] = text
        .split(";")
        .map(function (item: string) {
          return item.trim();
        });
      break;
  }

  return infoObject;
}

//----------------------------------------------------------------
// Public functions
//----------------------------------------------------------------
export function getHelpView({ team_id, api_app_id }) {
  let helpView = JSON.parse(JSON.stringify(slack_views.helpView));
  helpView.blocks.push({
    type: "section",
    text: {
      type: "mrkdwn",
      text: `Find more info here:\n<slack://app?team=${team_id}&id=${api_app_id}&tab=home|App Home> (only works in Slack App)`,
    },
  });

  return helpView;
}

export function getDetailsFromDialog({
  view: {
    state: { values },
    private_metadata,
  },
}) {
  let command =
    values[slack_cons.blockEntryDialogRadioButtons][
      slack_cons.actionEntryDialogRadioButtons
    ].selected_option.value;

  let channel =
    values[slack_cons.blockEntryDialogConversationSelect][
      slack_cons.actionEntryDialogConversationSelect
    ].selected_conversation;

  let thread = {};
  if (private_metadata && private_metadata !== "")
    thread = JSON.parse(private_metadata);

  return {
    command,
    channel,
    text: getCommandTextFromDialog({ command, values }),
    thread_ts: thread.channel === channel ? thread.thread_ts : undefined,
  };
}

export async function getResultMessage({ command, text, channel, thread_ts }) {
  let view;

  switch (command) {
    case slack_cons.commandLastmeet:
      view = await getLastmeetResult(getInfoObjectFromText({ command, text }));
      break;

    case slack_cons.commandBestmeet:
      view = await getBestmeetResult(getInfoObjectFromText({ command, text }));
      break;
  }

  view.channel = channel;
  if (thread_ts) view.thread_ts = thread_ts;

  return view;
}

export function getEntryMessage(event: AppMentionEvent) {
  let view = JSON.parse(JSON.stringify(slack_views.entryMessageView));

  view.channel = event.channel;
  view.user = event.user;

  if (event.thread_ts) view.thread_ts = event.thread_ts;

  return view;
}

export function getEntryDialog({ subviewName, thread_ts, channel }) {
  let baseView = JSON.parse(JSON.stringify(slack_views.entryDialogView));

  if (thread_ts && channel) {
    //save thread ts and channel
    baseView.view.private_metadata = JSON.stringify({ thread_ts, channel });

    //preselect channel
    baseView.view.blocks[1].element.initial_conversation = channel;

    //add context hint
    baseView.view.blocks.push(
      { type: "divider" },
      {
        type: "context",
        elements: [
          {
            type: "mrkdwn",
            text: `:exclamation: You started this message from a thread in channel <#${channel}>. If you change the channel the result will not be posted in the thread`,
          },
        ],
      }
    );
  }

  let subView;

  switch (subviewName) {
    case slack_cons.commandLastmeet:
      subView = slack_views.lastmeetSubView;
      break;
    case slack_cons.commandBestmeet:
      subView = slack_views.bestmeetSubView;
      break;
    case slack_cons.commandCompare:
      subView = slack_views.compareSubView;
      break;
    case slack_cons.commandMeetlink:
      subView = slack_views.meetLinkSubView;
      break;
    case slack_cons.commandRanking:
      subView = slack_views.rankingSubView;
      break;
    default:
      return baseView;
  }

  baseView.view.blocks = baseView.view.blocks.concat(subView);
  return baseView;
}

export function validateTextForCommand({ command, text }) {

  switch (command) {
    case slack_cons.commandLastmeet:
      if (
        !text ||
        !slack_cons.regexLifterNameValidation.test(text) ||
        text === ""
      )
        throw new errors.CommandSubmissionError(
          slack_cons.blockPerson1InputSubView,
          slack_cons.messageLifterNameNotValid
        );
      break;

    case slack_cons.commandBestmeet:
      if (!text || text === "")
        throw new errors.CommandSubmissionError(
          slack_cons.blockPerson1InputSubView,
          slack_cons.messageLifterNameNotValid
        );

      //split variables and remove spaces
      [texts.lifterName: string, texts.criteria] = text.split(";").map(function (item) {
        return item.trim();
      });

      if (
        !slack_cons.regexLifterNameValidation.test(texts.lifterName) ||
        texts.lifterName === ""
      )
        throw new errors.CommandSubmissionError({
          block: slack_cons.blockPerson1InputSubView,
          message: slack_cons.messageLifterNameNotValid,
        });

      if (
        !slack_cons.regexCriteriaValidation.test(texts.criteria) ||
        texts.criteria === ""
      )
        throw new errors.CommandSubmissionError({
          block: slack_cons.blockCriteriaInputSubView,
          message: slack_cons.messageCriteriaNotValid,
        });
      break;

    case slack_cons.commandCompare:
      if (!text || text === "")
        throw new errors.CommandSubmissionError({
          block: slack_cons.blockPerson1InputSubView,
          message: slack_cons.messageLifterNameNotValid,
        });

      //split variables and remove spaces
      [texts.lifterName, texts.criteria, texts.lift] = text
        .split(";")
        .map(function (item) {
          return item.trim();
        });

      // get all names
      texts.lifters = texts.lifterName.split(",").map(function (item) {
        return item.trim();
      });

      if (texts.lifters.length < 2)
        throw new errors.CommandSubmissionError({
          block: slack_cons.blockPerson2InputSubView,
          message: slack_cons.messageNotEnoughLifters,
        });

      texts.lifters.forEach((name) => {
        if (slack_cons.regexLifterNameValidation.test(name) && name !== "")
          return;

        throw new errors.CommandSubmissionError({
          block: slack_cons.blockPerson1InputSubView,
          message: slack_cons.messageLifterNameNotValid,
        });
      });

      if (
        !slack_cons.regexCriteriaValidation.test(texts.criteria) ||
        texts.criteria === ""
      )
        throw new errors.CommandSubmissionError({
          block: slack_cons.blockCriteriaInputSubView,
          message: slack_cons.messageCriteriaNotValid,
        });

      if (!slack_cons.regexLiftValidation.test(texts.lift) || texts.lift === "")
        throw new errors.CommandSubmissionError({
          block: slack_cons.blockLiftInputSubView,
          message: slack_cons.messageLiftNotValid,
        });
      break;
  }
}
