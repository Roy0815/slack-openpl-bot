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
  blockLastMeetSubViewPersonInput: "block_lastmeet_subview_person_input",

  //actions
  actionEntryDialogRadioButtons: "action_entry_dialog_radiobuttons",
  actionEntryDialogConversationSelect: "action_entrydialog_conversation_select",
  actionLastMeetSubViewPersonInput: "action_lastmeet_subview_person_input",

  //values for selects
  criteria: ["absolute", "dots", "wilks"],
  lift: ["squat", "bench", "deadlift", "total"],

  //regex validations
  regexLifterNameValidation: new RegExp(/^[A-Za-zÀ-ÖØ-öø-ÿ0-9 ]*$/),

  //messages
  messageLifterNameNotValid: `Please only use letters, spaces and numbers for the lifters name`,
  messagePendingResult: `Fetching data from database...`,
};
