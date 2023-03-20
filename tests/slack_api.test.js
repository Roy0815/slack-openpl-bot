const slack_funcs = require("../helpers/slack_functions");
const slack_views = require("../helpers/slack_views");
const slack_cons = require("../helpers/slack_constants");
const errors = require("../helpers/errors");

const channel = "ABCDEFGH";

//----------------------------------------------------------------
// Dialog View
//----------------------------------------------------------------
test("get Dialog - base", () => {
  expect(slack_funcs.getEntryDialog()).toEqual(slack_views.entryDialogView);
});

//----------------------------------------------------------------
// get Details from Dialog
//----------------------------------------------------------------
test("get Details from Dialog - lastmeet", () => {
  let expectedObject = {
    command: slack_cons.commandLastmeet,
    channel,
    text: "Roy Lotzwik",
  };

  expect(
    slack_funcs.getDetailsFromDialog({
      view: {
        state: {
          values: {
            [slack_cons.blockPerson1InputSubView]: {
              [slack_cons.actionPerson1InputSubView]: {
                value: expectedObject.text,
              },
            },
            [slack_cons.blockEntryDialogRadioButtons]: {
              [slack_cons.actionEntryDialogRadioButtons]: {
                selected_option: { value: expectedObject.command },
              },
            },
            [slack_cons.blockEntryDialogConversationSelect]: {
              [slack_cons.actionEntryDialogConversationSelect]: {
                selected_conversation: channel,
              },
            },
          },
        },
      },
    })
  ).toEqual(expectedObject);
});

test("get Details from Dialog - bestmeet", () => {
  let expectedObject = {
    command: slack_cons.commandBestmeet,
    channel,
    text: "Roy Lotzwik;dots",
  };

  expect(
    slack_funcs.getDetailsFromDialog({
      view: {
        state: {
          values: {
            [slack_cons.blockPerson1InputSubView]: {
              [slack_cons.actionPerson1InputSubView]: {
                value: "Roy Lotzwik",
              },
            },
            [slack_cons.blockCriteriaInputSubView]: {
              [slack_cons.actionCriteriaInputSubView]: {
                selected_option: { value: "dots" },
              },
            },
            [slack_cons.blockEntryDialogRadioButtons]: {
              [slack_cons.actionEntryDialogRadioButtons]: {
                selected_option: { value: expectedObject.command },
              },
            },
            [slack_cons.blockEntryDialogConversationSelect]: {
              [slack_cons.actionEntryDialogConversationSelect]: {
                selected_conversation: channel,
              },
            },
          },
        },
      },
    })
  ).toEqual(expectedObject);
});

//----------------------------------------------------------------
// validate Text for Command
//----------------------------------------------------------------
test("Validate Text for Command - lastmeet", () => {
  let command = slack_cons.commandLastmeet;

  //positives
  expect(() =>
    slack_funcs.validateTextForCommand({
      command,
      text: "Roy Lotzwik",
    })
  ).not.toThrow();
  expect(() =>
    slack_funcs.validateTextForCommand({
      command,
      text: "Roy Lotzwik #1",
    })
  ).not.toThrow();

  //negatives
  expect(() =>
    slack_funcs.validateTextForCommand({
      command,
      text: "Roy Lotzwik;",
    })
  ).toThrow(errors.CommandSubmissionError);
  expect(() =>
    slack_funcs.validateTextForCommand({
      command,
      text: "Roy Lotzwik;dots",
    })
  ).toThrow(errors.CommandSubmissionError);
});

test("Validate Text for Command - bestmeet", () => {
  let command = slack_cons.commandBestmeet;

  //positives
  expect(() =>
    slack_funcs.validateTextForCommand({
      command,
      text: "Roy Lotzwik;dots",
    })
  ).not.toThrow();
  expect(() =>
    slack_funcs.validateTextForCommand({
      command,
      text: "Roy Lotzwik #1  ; dots",
    })
  ).not.toThrow();

  //negatives
  expect(() =>
    slack_funcs.validateTextForCommand({
      command,
      text: "Roy Lotzwik;",
    })
  ).toThrow(errors.CommandSubmissionError);
  expect(() =>
    slack_funcs.validateTextForCommand({
      command,
      text: "Roy Lotzwik",
    })
  ).toThrow(errors.CommandSubmissionError);
  expect(() =>
    slack_funcs.validateTextForCommand({
      command,
      text: "Roy Lotzwik #1",
    })
  ).toThrow(errors.CommandSubmissionError);
  expect(() =>
    slack_funcs.validateTextForCommand({
      command,
      text: "Roy Lotzwik #1;anyformula",
    })
  ).toThrow(errors.CommandSubmissionError);
});
