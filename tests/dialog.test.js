import {
  getEntryDialog,
  getDetailsFromDialog,
} from "../helpers/slack_functions";
import { entryDialogView } from "../helpers/slack_views";
import {
  commandLastmeet,
  blockPerson1InputSubView,
  actionPerson1InputSubView,
  blockEntryDialogRadioButtons,
  actionEntryDialogRadioButtons,
  blockEntryDialogConversationSelect,
  actionEntryDialogConversationSelect,
  commandBestmeet,
  blockCriteriaInputSubView,
  actionCriteriaInputSubView,
} from "../helpers/slack_constants";

const channel = "ABCDEFGH";

//----------------------------------------------------------------
// Dialog View
//----------------------------------------------------------------
test("get Dialog - base", () => {
  expect(getEntryDialog({})).toEqual(entryDialogView);
});

//----------------------------------------------------------------
// get Details from Dialog - lastmeet
//----------------------------------------------------------------
test("get Details from Dialog - lastmeet", () => {
  let expectedObject = {
    command: commandLastmeet,
    channel,
    text: "Roy Lotzwik",
    thread_ts: undefined,
  };

  expect(
    getDetailsFromDialog({
      view: {
        state: {
          values: {
            [blockPerson1InputSubView]: {
              [actionPerson1InputSubView]: {
                value: expectedObject.text,
              },
            },
            [blockEntryDialogRadioButtons]: {
              [actionEntryDialogRadioButtons]: {
                selected_option: { value: expectedObject.command },
              },
            },
            [blockEntryDialogConversationSelect]: {
              [actionEntryDialogConversationSelect]: {
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
// get Details from Dialog - bestmeet
//----------------------------------------------------------------
test("get Details from Dialog - bestmeet", () => {
  let expectedObject = {
    command: commandBestmeet,
    channel,
    text: "Roy Lotzwik;dots",
    thread_ts: undefined,
  };

  expect(
    getDetailsFromDialog({
      view: {
        state: {
          values: {
            [blockPerson1InputSubView]: {
              [actionPerson1InputSubView]: {
                value: "Roy Lotzwik",
              },
            },
            [blockCriteriaInputSubView]: {
              [actionCriteriaInputSubView]: {
                selected_option: { value: "dots" },
              },
            },
            [blockEntryDialogRadioButtons]: {
              [actionEntryDialogRadioButtons]: {
                selected_option: { value: expectedObject.command },
              },
            },
            [blockEntryDialogConversationSelect]: {
              [actionEntryDialogConversationSelect]: {
                selected_conversation: channel,
              },
            },
          },
        },
      },
    })
  ).toEqual(expectedObject);
});
