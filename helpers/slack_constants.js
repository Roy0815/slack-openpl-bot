module.exports = {
  //commands
  commandDialog: "openpl",
  commandLastmeet: "lastmeet",
  commandBestmeet: "bestmeet",
  commandCompare: "compare",
  commandMeetlink: "meetlink",
  commandRanking: "ranking",

  //view
  viewNameEntryDialog: "entrydialog",

  //blocks
  blockEntryDialogRadioButtons: "block_entrydialog_radiobuttons",
  blockEntryDialogConversationSelect: "block_entrydialog_conversation_select",
  blockPerson1InputSubView: "block_person1_input_subview",
  blockPerson2InputSubView: "block_person2_input_subview",
  blockCriteriaInputSubView: "block_criteria_input_subview",

  //actions
  actionEntryDialogRadioButtons: "action_entry_dialog_radiobuttons",
  actionEntryDialogConversationSelect: "action_entrydialog_conversation_select",
  actionPerson1InputSubView: "action_person1_input_subview",
  actionPerson2InputSubView: "action_person2_input_subview",
  actionCriteriaInputSubView: "action_criteria_input_subview",

  //values for selects
  criteria: ["absolute", "dots", "wilks"],
  lift: ["squat", "bench", "deadlift", "total"],

  //regex validations
  regexLifterNameValidation: new RegExp(/^[A-Za-zÀ-ÖØ-öø-ÿ0-9 #]*$/),

  //messages
  messageLifterNameNotValid: `Please only use letters, spaces and numbers (e.g. #1) for the lifters name`,
  messagePendingResult: `Fetching data from database...`,
};
