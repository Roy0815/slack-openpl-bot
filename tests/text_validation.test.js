import { validateTextForCommand } from "../helpers/slack_functions";
import {
  commandLastmeet,
  commandBestmeet,
  commandCompare,
} from "../helpers/slack_constants";
import { CommandSubmissionError } from "../helpers/errors";

//----------------------------------------------------------------
// lastmeet
//----------------------------------------------------------------
test("Validate Text for Command - lastmeet", () => {
  let command = commandLastmeet;

  //positives
  expect(() =>
    validateTextForCommand({
      command,
      text: "Roy Lotzwik",
    })
  ).not.toThrow();
  expect(() =>
    validateTextForCommand({
      command,
      text: "Roy Lotzwik #1",
    })
  ).not.toThrow();

  //negatives
  expect(() =>
    validateTextForCommand({
      command,
      text: "Roy Lotzwik;",
    })
  ).toThrow(CommandSubmissionError);
  expect(() =>
    validateTextForCommand({
      command,
      text: "Roy Lotzwik;dots",
    })
  ).toThrow(CommandSubmissionError);
});

//----------------------------------------------------------------
// bestmeet
//----------------------------------------------------------------
test("Validate Text for Command - bestmeet", () => {
  let command = commandBestmeet;

  //positives
  expect(() =>
    validateTextForCommand({
      command,
      text: "Roy Lotzwik;dots",
    })
  ).not.toThrow();
  expect(() =>
    validateTextForCommand({
      command,
      text: "Roy Lotzwik #1  ; dots",
    })
  ).not.toThrow();

  //negatives
  expect(() =>
    validateTextForCommand({
      command,
      text: "Roy Lotzwik;",
    })
  ).toThrow(CommandSubmissionError);
  expect(() =>
    validateTextForCommand({
      command,
      text: "Roy Lotzwik",
    })
  ).toThrow(CommandSubmissionError);
  expect(() =>
    validateTextForCommand({
      command,
      text: "Roy Lotzwik #1",
    })
  ).toThrow(CommandSubmissionError);
  expect(() =>
    validateTextForCommand({
      command,
      text: "Roy Lotzwik #1;anyformula",
    })
  ).toThrow(CommandSubmissionError);
});

//----------------------------------------------------------------
// compare
//----------------------------------------------------------------
test("Validate Text for Command - compare", () => {
  let command = commandCompare;

  //positives
  expect(() =>
    validateTextForCommand({
      command,
      text: "Roy Lotzwik, Simon Oswald;dots;total",
    })
  ).not.toThrow();
  expect(() =>
    validateTextForCommand({
      command,
      text: "Roy Lotzwik #1 , Simon Daniàl Òswald ; wilks; squat",
    })
  ).not.toThrow();
  expect(() =>
    validateTextForCommand({
      command,
      text: "Roy Lotzwik #1 , Simon Daniàl Òswald, Royberto Blanko ; wilks; squat",
    })
  ).not.toThrow();

  //negatives
  expect(() =>
    validateTextForCommand({
      command,
      text: "Roy Lotzwik; wilks; squat",
    })
  ).toThrow(CommandSubmissionError);
  expect(() =>
    validateTextForCommand({
      command,
      text: "Roy Lotzwik, Simon Daniel Oswald;wilks",
    })
  ).toThrow(CommandSubmissionError);
  expect(() =>
    validateTextForCommand({
      command,
      text: "Roy Lotzwik, Simon Daniel Oswald;squat;wilks",
    })
  ).toThrow(CommandSubmissionError);
  expect(() =>
    validateTextForCommand({
      command,
      text: "Roy Lotzwik #1, Simon Oswald;dots;bänch",
    })
  ).toThrow(CommandSubmissionError);
  expect(() =>
    validateTextForCommand({
      command,
      text: "Roy Lotzwik #1; Simon Oswald;dots;bänch",
    })
  ).toThrow(CommandSubmissionError);
});
