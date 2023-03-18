// file with everything for slack interactions
const slack_views = require("./slack_views");
const slack_cons = require("./slack_constants");
const db_funcs = require("./database_functions");
const errors = require("./errors");

//----------------------------------------------------------------
// Private functions
//----------------------------------------------------------------
function getSingleMeetResultView({ personObj, channel }) {
  let resultMessage = JSON.parse(
    JSON.stringify(slack_views.singlemeetResultMessageView)
  );

  resultMessage.blocks[0].fields[0].text = `*Meet:* ${personObj.meetname}`;
  resultMessage.blocks[0].fields[1].text = `*Date:* ${personObj.date}`;

  resultMessage.blocks[1].fields[0].text = `*Categorie:* ${personObj.division}`;
  resultMessage.blocks[1].fields[1].text = `*Class:* ${personObj.weightclasskg}`;
  resultMessage.blocks[1].fields[2].text = `*Place:* ${
    personObj.place == 1
      ? "🥇"
      : personObj.place == 2
      ? "🥈"
      : personObj.place == 3
      ? "🥉"
      : personObj.place
  }`;
  resultMessage.blocks[1].fields[3].text = `*Dots:* ${personObj.dots}`;

  resultMessage.blocks[2].fields[0].text = `*Squat:* ${personObj.best3squatkg}`;
  resultMessage.blocks[2].fields[1].text = `*Bench:* ${personObj.best3benchkg}`;
  resultMessage.blocks[2].fields[2].text = `*Deadlift:* ${personObj.best3deadliftkg}`;
  resultMessage.blocks[2].fields[3].text = `*Total:* ${personObj.totalkg}`;

  resultMessage.channel = channel;
  return resultMessage;
}

async function getLastmeetResult({ channel, person }) {
  //check user exists and is unique
  let users = await db_funcs.selectUsers([person]);

  if (users.length > 1) {
    //TODO: ambiguous users
    console.log(users);
    return;
  }

  if (users.length == 0) throw new errors.NoUserFoundError(person);

  //fetch data from database
  let { rows } = await db_funcs.selectLastMeet(person);

  //build view
  let view = getSingleMeetResultView({ personObj: rows[0], channel: channel });

  view.text = `Last meet of *${rows[0].name}*`; //message preview
  view.blocks[0].text.text = `Last meet of *${rows[0].name}* <https://www.openpowerlifting.org/u/roylotzwik|openpowerlifting.org>`;

  return view;
}

function getBestmeetResult(channel, person) {
  let resultMessage = JSON.parse(
    JSON.stringify(slack_views.singlemeetResultMessageView)
  );
  resultMessage.text = `Best meet of ${person.name}`; //message preview
  resultMessage.blocks[0].text.text = `Best meet of *${person.name}* <https://www.openpowerlifting.org/u/roylotzwik|openpowerlifting.org>`;

  resultMessage.blocks[0].fields[0].text = `*Meet:* ${person.meetname}`;
  resultMessage.blocks[0].fields[1].text = `*Date:* ${person.date}`;

  resultMessage.blocks[1].fields[0].text = `*Categorie:* ${person.division}`;
  resultMessage.blocks[1].fields[1].text = `*Class:* ${person.weightclasskg}`;
  resultMessage.blocks[1].fields[2].text = `*Place:* ${person.place}`;
  resultMessage.blocks[1].fields[3].text = `*Dots:* ${person.dots}`;

  resultMessage.blocks[2].fields[0].text = `*Squat:* ${person.best3squatkg}`;
  resultMessage.blocks[2].fields[1].text = `*Bench:* ${person.best3benchkg}`;
  resultMessage.blocks[2].fields[2].text = `*Deadlift:* ${person.best3deadliftkg}`;
  resultMessage.blocks[2].fields[3].text = `*Total:* ${person.totalkg}`;

  resultMessage.channel = channel;
  return resultMessage;
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

//----------------------------------------------------------------
// Public functions
//----------------------------------------------------------------
function getHelpView({ team_id, api_app_id }) {
  let helpView = slack_views.helpView;
  helpView.blocks.push({
    type: "section",
    text: {
      type: "mrkdwn",
      text: `Find more info here: <slack://app?team=${team_id}&id=${api_app_id}&tab=home|App Home>`,
    },
  });

  return helpView;
}

async function getResultMessage({ command, text, channel }) {
  let view;

  switch (command) {
    case slack_cons.commandLastmeet:
      view = await getLastmeetResult({ channel: channel, person: text });
      break;

    default:
      break;
  }

  return view;
}

function getEntryMessage({ channel, user, thread_ts }) {
  let view = JSON.parse(JSON.stringify(slack_views.entryMessageView));

  view.channel = channel;
  view.user = user;

  if (thread_ts) view.thread_ts = thread_ts;

  return view;
}

function getEntryDialog(subviewName) {
  let baseView = JSON.parse(JSON.stringify(slack_views.entryDialogView));
  let subView;

  switch (subviewName) {
    case "lastmeet":
      subView = slack_views.lastmeetSubView;
      break;
    case "bestmeet":
      subView = slack_views.bestmeetSubView;
      break;
    case "compare":
      subView = slack_views.compareSubView;
      break;
    case "top10":
      subView = slack_views.top10SubView;
      break;
    default:
      return baseView;
  }

  baseView.view.blocks = baseView.view.blocks.concat(subView);
  return baseView;
}

//exports
module.exports = {
  getHelpView,
  getResultMessage,
  getEntryDialog,
  getEntryMessage,
};
