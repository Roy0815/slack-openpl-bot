//commands
export const commandDialog = "openpl";
export const commandLastmeet = "lastmeet";
export const commandBestmeet = "bestmeet";
export const commandCompare = "compare";
export const commandMeetlink = "meetlink";
export const commandRanking = "ranking";
export const Commands = [
  commandDialog,
  commandLastmeet,
  commandBestmeet,
  commandCompare,
  commandMeetlink,
  commandRanking,
] as const;

//view
export const viewNameEntryDialog = "entrydialog";

//blocks
export const blockEntryDialogRadioButtons = "block_entrydialog_radiobuttons";
export const blockEntryDialogConversationSelect =
  "block_entrydialog_conversation_select";
export const blockPerson1InputSubView = "block_person1_input_subview";
export const blockPerson2InputSubView = "block_person2_input_subview";
export const blockCriteriaInputSubView = "block_criteria_input_subview";
export const blockLiftInputSubView = "block_lift_input_subview";
export const blockMeetNameInputSubView = "block_meet_name_input_subview";

//actions
export const actionEntryDialogRadioButtons = "action_entry_dialog_radiobuttons";
export const actionEntryDialogConversationSelect =
  "action_entrydialog_conversation_select";
export const actionPerson1InputSubView = "action_person1_input_subview";
export const actionPerson2InputSubView = "action_person2_input_subview";
export const actionCriteriaInputSubView = "action_criteria_input_subview";
export const actionLiftInputSubView = "action_lift_input_subview";
export const actionMeetNameInputSubView = "action_meet_name_input_subview";

//values for commands
export const criteriaAbsolute = "absolute";
export const criteriaDots = "dots";
export const criteriaWilks = "wilks";
export const CriteriaArr = [
  criteriaAbsolute,
  criteriaDots,
  criteriaWilks,
] as const;

export const liftSquat = "squat";
export const liftBench = "bench";
export const liftDeadlift = "deadlift";
export const liftTotal = "total";
export const Lifts = [liftSquat, liftBench, liftDeadlift, liftTotal] as const;

//regex validations
export const regexFunctionalCommands: RegExp = new RegExp(
  `^/(\\b${Commands.join("\\b)|(\\b")}\\b)$`
);
export const regexLifterNameValidation: RegExp = /^[A-Za-zÀ-ÖØ-öø-ÿ0-9 #]*$/;
export const regexCriteriaValidation: RegExp = new RegExp(
  `^/(\\b${CriteriaArr.join("\\b)|(\\b")}\\b)$`
);
export const regexLiftValidation: RegExp = new RegExp(
  `^/(\\b${Lifts.join("\\b)|(\\b")}\\b)$`
);

//messages
export const messageLifterNameNotValid = `Please only use letters, spaces and numbers (e.g. #1) for the lifters name`;
export const messageNotEnoughLifters = `At least two lifters must be specified`;
export const messageCriteriaNotValid =
  "Please only use `absolute`, `dots` or `wilks` as criteria";
export const messageLiftNotValid =
  "Please only use `squat`, `bench`, `deadlift` or `total` as lift";
export const messagePendingResult = `Fetching data from database...`;
