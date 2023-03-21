const commandDialog = "openpl";
const commandLastmeet = "lastmeet";
const commandBestmeet = "bestmeet";
const commandCompare = "compare";
const commandMeetlink = "meetlink";
const commandRanking = "ranking";

module.exports = {
  //commands
  commandDialog,
  commandLastmeet,
  commandBestmeet,
  commandCompare,
  commandMeetlink,
  commandRanking,

  //view
  viewNameEntryDialog: "entrydialog",

  //blocks
  blockEntryDialogRadioButtons: "block_entrydialog_radiobuttons",
  blockEntryDialogConversationSelect: "block_entrydialog_conversation_select",
  blockPerson1InputSubView: "block_person1_input_subview",
  blockPerson2InputSubView: "block_person2_input_subview",
  blockCriteriaInputSubView: "block_criteria_input_subview",
  blockLiftInputSubView: "block_lift_input_subview",
  blockMeetNameInputSubView: "block_meet_name_input_subview",

  //actions
  actionEntryDialogRadioButtons: "action_entry_dialog_radiobuttons",
  actionEntryDialogConversationSelect: "action_entrydialog_conversation_select",
  actionPerson1InputSubView: "action_person1_input_subview",
  actionPerson2InputSubView: "action_person2_input_subview",
  actionCriteriaInputSubView: "action_criteria_input_subview",
  actionLiftInputSubView: "action_lift_input_subview",
  actionMeetNameInputSubView: "action_meet_name_input_subview",

  //values for commands
  criteriaAbsolute: "absolute",
  criteriaDots: "dots",
  criteriaWilks: "wilks",

  liftSquat: "squat",
  liftBench: "bench",
  liftDeadlift: "deadlift",
  liftTotal: "total",

  //regex validations
  regexFunctionalCommands: new RegExp(
    `^/(\\b${commandLastmeet}\\b)|(\\b${commandBestmeet}\\b)|(\\b${commandCompare}\\b)|(\\b${commandMeetlink}\\b)|(\\b${commandRanking}\\b)$`
  ),
  regexLifterNameValidation: /^[A-Za-zÀ-ÖØ-öø-ÿ0-9 #]*$/,
  regexCriteriaValidation: /^(\babsolute\b)|(\bdots\b)|(\bwilks\b)$/,
  regexLiftValidation: /^(\bsquat\b)|(\bbench\b)|(\bdeadlift\b)|(\btotal\b)$/,

  //messages
  messageLifterNameNotValid: `Please only use letters, spaces and numbers (e.g. #1) for the lifters name`,
  messageNotEnoughLifters: `At least two lifters must be specified`,
  messageCriteriaNotValid:
    "Please only use `absolute`, `dots` or `wilks` as criteria",
  messageLiftNotValid:
    "Please only use `squat`, `bench`, `deadlift` or `total` as lift",
  messagePendingResult: `Fetching data from database...`,
};
