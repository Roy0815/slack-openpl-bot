// file with everything for slack interactions

//views
const entryMessageView = {
    channel: "",
    text: "You mentioned me in your message, do you want to start a lookup?", //this is required as a preview
    user: "",
    thread_ts: "",
    blocks: [
        {
			type: "section",
			text: {
				type: "mrkdwn",
				text: "You mentioned me in your message, do you want to start a lookup?"
			}
		},
		{
			type: "actions",
			elements: [
				{
					type: "button",
					text: {
						type: "plain_text",
						text: "Yes",
						emoji: true
					},
                    action_id: "entrymessage_start",
                    style: "primary"
				},
				{
					type: "button",
					text: {
						type: "plain_text",
						text: "No",
						emoji: true
					},
                    action_id: "entrymessage_cancel"
				}
			]
		}
    ]
};

const entryDialogView = {
    trigger_id: '',
    view: {
        type: "modal",
        callback_id: "entrydialog",
        submit: {
            type: "plain_text",
            text: "Submit",
            emoji: true
        },
        close: {
            type: "plain_text",
            text: "Cancel",
            emoji: true
        },
        title: {
            type: "plain_text",
            text: "Openpowerlifting Bot"
        },
        blocks: [
            {
                type: "section",
                block_id: "entrydialog_radiobuttons",
                text: {
                    type: "mrkdwn",
                    text: "Please choose the action you want to take"
                },
                accessory: {
                    type: "radio_buttons",
                    action_id: "entrydialog_radiobuttons",
                    options: [
                        {
                            text: {
                                type: "plain_text",
                                text: "Last Meet",
                                emoji: true
                            },
                            value: "lastmeet"
                        },
                        {
                            text: {
                                type: "plain_text",
                                text: "Best Meet",
                                emoji: true
                            },
                            value: "bestmeet"
                        },
                        {
                            text: {
                                type: "plain_text",
                                text: "Compare",
                                emoji: true
                            },
                            value: "compare"
                        },
                        {
                            text: {
                                type: "plain_text",
                                text: "Top 10 by criteria",
                                emoji: true
                            },
                            value: "top10"
                        }
                    ]
                }
            }
        ]
    }
};

const lastmeetSubView = [
    {
        type: "divider"
    },
    {
        type: "input",
        element: {
            type: "plain_text_input",
            action_id: "lastmeet_person_input",
            placeholder: {
                type: "plain_text",
                text: "Firstname Lastname [#]",
                emoji: true
            }
        },
        label: {
            type: "plain_text",
            text: "Person",
            emoji: true
        }
    }
];

const bestmeetSubView = [
    {
        type: "divider"
    },
    {
        type: "input",
        element: {
            type: "plain_text_input",
            action_id: "bestmeet_person_input",
            placeholder: {
                type: "plain_text",
                text: "Firstname Lastname [#]",
                emoji: true
            }
        },
        label: {
            type: "plain_text",
            text: "Person",
            emoji: true
        }
    },
    {
        type: "section",
        text: {
            type: "mrkdwn",
            text: "By criteria"
        },
        accessory: {
            type: "static_select",
            action_id: "bestmeet_criteria_input",
            initial_option: {
                text: {
                    type: "plain_text",
                    text: "Dots",
                    emoji: true
                },
                value: "dots"
            },
            options: [
                {
                    text: {
                        type: "plain_text",
                        text: "Total",
                        emoji: true
                    },
                    value: "total"
                },
                {
                    text: {
                        type: "plain_text",
                        text: "Wilks",
                        emoji: true
                    },
                    value: "wilks"
                },
                {
                    text: {
                        type: "plain_text",
                        text: "Dots",
                        emoji: true
                    },
                    value: "dots"
                }
            ]
        }
    }
];

const compareSubView = [
    {
        type: "divider"
    },
    {
        type: "input",
        element: {
            type: "plain_text_input",
            action_id: "compare_person1_input",
            placeholder: {
                type: "plain_text",
                text: "Firstname Lastname [#]",
                emoji: true
            }
        },
        label: {
            type: "plain_text",
            text: "Person 1",
            emoji: true
        }
    },
    {
        type: "input",
        element: {
            type: "plain_text_input",
            action_id: "compare_person2_input",
            placeholder: {
                type: "plain_text",
                text: "Firstname Lastname [#]",
                emoji: true
            }
        },
        label: {
            type: "plain_text",
            text: "Person 2",
            emoji: true
        }
    },
    {
        type: "section",
        text: {
            type: "mrkdwn",
            text: "By criteria"
        },
        accessory: {
            type: "static_select",
            action_id: "compare_criteria_input",
            initial_option: {
                text: {
                    type: "plain_text",
                    text: "Dots",
                    emoji: true
                },
                value: "dots"
            },
            options: [
                {
                    text: {
                        type: "plain_text",
                        text: "Total",
                        emoji: true
                    },
                    value: "total"
                },
                {
                    text: {
                        type: "plain_text",
                        text: "Wilks",
                        emoji: true
                    },
                    value: "wilks"
                },
                {
                    text: {
                        type: "plain_text",
                        text: "Dots",
                        emoji: true
                    },
                    value: "dots"
                }
            ]
        }
    }
];

const top10SubView = [
    {
        type: "divider"
    },
    {
        type: "input",
        element: {
            type: "plain_text_input",
            action_id: "top10_meet_input",
            placeholder: {
                type: "plain_text",
                text: "optional",
                emoji: true
            }
        },
        label: {
            type: "plain_text",
            text: "Meet Name",
            emoji: true
        }
    },
    {
        type: "section",
        text: {
            type: "mrkdwn",
            text: "Compare method"
        },
        accessory: {
            type: "static_select",
            action_id: "top10_comparemethod_input",
            initial_option: {
                text: {
                    type: "plain_text",
                    text: "Dots",
                    emoji: true
                },
                value: "dots"
            },
            options: [
                {
                    text: {
                        type: "plain_text",
                        text: "Total",
                        emoji: true
                    },
                    value: "total"
                },
                {
                    text: {
                        type: "plain_text",
                        text: "Wilks",
                        emoji: true
                    },
                    value: "wilks"
                },
                {
                    text: {
                        type: "plain_text",
                        text: "Dots",
                        emoji: true
                    },
                    value: "dots"
                }
            ]
        }
    },
    {
        type: "section",
        text: {
            type: "mrkdwn",
            text: "Gender"
        },
        accessory: {
            type: "static_select",
            action_id: "top10_gender_input",
            placeholder: {
                type: "plain_text",
                text: "optional",
                emoji: true
            },
            options: [
                {
                    text: {
                        type: "plain_text",
                        text: "Male",
                        emoji: true
                    },
                    value: "m"
                },
                {
                    text: {
                        type: "plain_text",
                        text: "Female",
                        emoji: true
                    },
                    value: "f"
                },
                {
                    text: {
                        type: "plain_text",
                        text: "Mx",
                        emoji: true
                    },
                    value: "mx"
                }
            ]
        }
    },
    {
        type: "section",
        text: {
            type: "mrkdwn",
            text: "Tested"
        },
        accessory: {
            type: "static_select",
            action_id: "top10_tested_input",
            placeholder: {
                type: "plain_text",
                text: "optional",
                emoji: true
            },
            options: [
                {
                    text: {
                        type: "plain_text",
                        text: "Yes",
                        emoji: true
                    },
                    value: "tested"
                },
                {
                    text: {
                        type: "plain_text",
                        text: "No",
                        emoji: true
                    },
                    value: "untested"
                }
            ]
        }
    }
];

//view builder functions
function getEntryDialog(subviewName) {
    let baseView = JSON.parse(JSON.stringify(entryDialogView));

    switch (subviewName){
        case 'lastmeet':
            subView = lastmeetSubView;
            break;
        case 'bestmeet':
            subView = bestmeetSubView;
            break;
        case 'compare':
            subView = compareSubView;
            break;
        case 'top10':
            subView = top10SubView;
            break;
        default:
            return baseView;
    }

    baseView.view.blocks = baseView.view.blocks.concat(subView);
    console.log(baseView.view.blocks);
    console.log(entryDialogView.view.blocks);
    return baseView;
}

//exports
module.exports = {
    getEntryDialog,
    entryMessageView
};