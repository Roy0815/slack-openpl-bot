const slack_funcs = require("../helpers/slack_functions");
const slack_cons = require("../helpers/slack_constants");
const errors = require("../helpers/errors");

const channel = "ABCDEFGH";

//----------------------------------------------------------------
// lastmeet
//----------------------------------------------------------------
test("Validate get Result Message - lastmeet", async () => {
  let command = slack_cons.commandLastmeet;

  let input = {
    command,
    channel,
    text: "Roy Lotzwik",
  };

  //negatives
  await expect(slack_funcs.getResultMessage(input)).rejects.toThrow(
    errors.AmbiguousLifterError
  );

  input.text = "Roy";
  await expect(slack_funcs.getResultMessage(input)).rejects.toThrow(
    errors.AmbiguousLifterError
  );

  input.text = "";
  await expect(slack_funcs.getResultMessage(input)).rejects.toThrow(
    errors.NoLifterFoundError
  );

  //positives
  input.text = "Roy Lotzwik #1";
  let result = await slack_funcs.getResultMessage(input);

  expect(result.channel).toEqual(channel);
  expect(result.text).toMatch(/Last meet/);
});

//----------------------------------------------------------------
// bestmeet
//----------------------------------------------------------------
test("Validate get Result Message - bestmeet", async () => {
  let command = slack_cons.commandBestmeet;

  let input = {
    command,
    channel,
    text: "Roy Lotzwik",
  };

  //negatives
  await expect(slack_funcs.getResultMessage(input)).rejects.toThrow(
    errors.AmbiguousLifterError
  );

  input.text = "Roy";
  await expect(slack_funcs.getResultMessage(input)).rejects.toThrow(
    errors.AmbiguousLifterError
  );

  input.text = "";
  await expect(slack_funcs.getResultMessage(input)).rejects.toThrow(
    errors.NoLifterFoundError
  );

  //positives
  input.text = "Roy Lotzwik #1  ; dots";
  let result = await slack_funcs.getResultMessage(input);

  expect(result.channel).toEqual(channel);
  expect(result.text).toMatch(/Best meet/);
});
