const slack_funcs = require("../helpers/slack_functions");
const slack_cons = require("../helpers/slack_constants");
const errors = require("../helpers/errors");

//----------------------------------------------------------------
// lastmeet
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

//----------------------------------------------------------------
// bestmeet
//----------------------------------------------------------------
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
