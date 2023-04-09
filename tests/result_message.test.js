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
  expect(result.blocks[0].text.text).toEqual(
    "Last meet of *Roy Lotzwik* <https://www.openpowerlifting.org/u/roylotzwik|openpowerlifting.org>"
  );
  expect(result.blocks[2].fields[0].text).toEqual(
    "*Meet:* BW Meisterschaften 2019"
  );
  expect(result.blocks[3].fields[0].text).toEqual("*Categorie:* Juniors");
  expect(result.blocks[4].fields[0].text).toEqual("*Squat:* 255 kg");
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
  expect(result.blocks[0].text.text).toEqual(
    "Best meet of *Roy Lotzwik* <https://www.openpowerlifting.org/u/roylotzwik|openpowerlifting.org>"
  );
  expect(result.blocks[2].fields[0].text).toEqual(
    "*Meet:* BW Meisterschaften 2019"
  );
  expect(result.blocks[3].fields[0].text).toEqual("*Categorie:* Juniors");
  expect(result.blocks[4].fields[0].text).toEqual("*Squat:* 255 kg");
});
