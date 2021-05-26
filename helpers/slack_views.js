//file with all frontend data for slack
//function names
const commandDialog = 'openpl'
const commandLastmeet = 'lastmeet'
const commandBestmeet = 'bestmeet'
const commandCompare = 'compare'
const commandMeetlink = 'meetlink'
const commandRanking = 'ranking'

//views for multiple reference
const helpSubView = [
    {
        type: 'section',
        text: {
            type: 'mrkdwn',
            text: 'You can start actions in the following ways:'
        }
    },
    {
        type: 'section',
        text: {
            type: 'mrkdwn',
            text: '*1️⃣ Use the `/openpl` command.* Type `/openpl` to start a dialog where you can interactively select the information you want to display. In the conversation select you have to specify the channel where I will post the result.'
        }
    },
    {
        type: 'section',
        text: {
            type: 'mrkdwn',
            text: "*2️⃣ Use the other `/` commands.* For each action there is also a _shortcut_ `/` command with a specific set of options. Using those commands won't open a dialog. All commands and options are listed below:\n`/lastmeet [name]`\nreturns the last meet of the person\n\n`/bestmeet [name]; [criteria]`\nreturns the best meet of the person by criteria\n\n`/compare [names]; [criteria]; [lift]`\ncompares two or more lifters by criteria and lift\n\n`/meetlink [meetname]`\nreturns the link to the meet\n\n`/ranking [filter]`\nreturns the link to openpowerlifting.org with the specified filters applied"
        }
    },
    {
        type: 'section',
        text: {
            type: 'mrkdwn',
            text: '*3️⃣ Mention the bot in a channel or thread `@Openpowerlifting Bot`.* You can use this method as kind of a shortcut too, but more important: this is the only way you can get the results into a thread.\nUse it as follows: `@Openpowerlifting Bot [command]; [options]`\n'
        }
    }
]

//export views
module.exports = {
    commandDialog,
    commandLastmeet,
    commandBestmeet,
    commandCompare,
    commandMeetlink,
    commandRanking,
    helpSubView,

    helpView: {
        blocks: [helpSubView[0], helpSubView[1], helpSubView[2], helpSubView[3]]
    },

    homeView: {
        // Use the user ID associated with the event
        user_id: '',
        view: {
            type: 'home',
            blocks: [
                {
                    type: 'section',
                    text: {
                        type: 'mrkdwn',
                        text: "Hey, nice to have you here 👋 I'm Openpowerlifting Bot. I'm here to get you data from openpowerlifting.org for information, comparison and competetion with your friends.\n\nMake sure the bot is added to the channel where you want to post the results. If I am not in it you can invite me by typing `/invite @Openpowerlifting Bot`."
                    }
                },
                helpSubView[0],
                helpSubView[1],
                helpSubView[2],
                helpSubView[3],
                {
                    type: 'divider'
                },
                {
                    type: 'section',
                    text: {
                        type: 'mrkdwn',
                        text: '*Options explanation*\nSince all those options can be confusing, lets explain them a bit more in detail. Generally speaking, one square bracket equals one option.\nThey have to be replaced by the value you want to use. If multiple options are required, separate them with a semicolon `;`.\n\nAll options are described below:\n\n*`[name]`*\nThe name of the lifter you want to look up, alternatively you can tag users too e.g. `@Max`.\n\n*`[names]`*\nBasically the same option as `[name]`, with the small difference that a list of names can be specified. Separate each name entered with a colon `,`.\n\n*`[criteria]`*\nThe criteria for the ranking of the lifters. Available options are `absolute`, `dots` and `wilks`.\n\n*`[lift]`*\nSpecify the lift you want to compare. Available options are `squat`, `bench`, `deadlift` and `total`.\n\n*`[meetname]`*\nSpecify the meet you want to look up.\n\n*`[command]` and `[options]`*\nUsed for the shortcut, the command is equal to the commands listed under point 2️⃣. Those will then be combined with the set of options that is listed in the same point, e.g. `@Openpowerlifting Bot bestmeet Max Mustermann; dots`\n\n*`[filter]`*\nSpecify the filters for the ranking. All filters are optional. If one is not supplied the default is used. Example usage of filters: `/ranking sex=male,federation=ipf`.\nThe available options are:\n\n• *federation:* Specify the federation abbreviation listed on the website or a whole country in the format `all-country`. Default: `all`\n\n• *equipment:* Specify the equipment you want to compare, available options are `raw`, `wraps`, `single`, `multi` and `unlimited`. Default: `raw+wraps`\n\n• *weightclass:* Weightclass with a `.` as decimal delimiter and `+` after the number for open classes e.g.: `82.5`, `120+`; _duplicate weightclasses will currently default to common class or IPF._ Default: `all`\n\n• *sex:* Currently only `men` and `women` are supported by the website. Default: `all`\n\n• *criteria:* Sorting criteria, same options as in `[criteria]`. Default: `dots`'
                    }
                },
                {
                    type: 'divider'
                },
                {
                    type: 'context',
                    elements: [
                        {
                            type: 'mrkdwn',
                            text: '❓Get help at any time with `/openpl help`'
                        }
                    ]
                }
            ]
        }
    },

    entryMessageView: {
        channel: '',
        text: 'You mentioned me in your message, do you want to start a lookup?', //this is required as a preview
        user: '',
        thread_ts: '',
        blocks: [
            {
                type: 'section',
                text: {
                    type: 'mrkdwn',
                    text: 'You mentioned me in your message, do you want to start a lookup?'
                }
            },
            {
                type: 'actions',
                elements: [
                    {
                        type: 'button',
                        text: {
                            type: 'plain_text',
                            text: 'Yes',
                            emoji: true
                        },
                        action_id: 'entrymessage_start',
                        style: 'primary'
                    },
                    {
                        type: 'button',
                        text: {
                            type: 'plain_text',
                            text: 'No',
                            emoji: true
                        },
                        action_id: 'entrymessage_cancel'
                    }
                ]
            }
        ]
    },

    entryDialogView: {
        trigger_id: '',
        view: {
            type: 'modal',
            callback_id: 'entrydialog',
            submit: {
                type: 'plain_text',
                text: 'Submit',
                emoji: true
            },
            close: {
                type: 'plain_text',
                text: 'Cancel',
                emoji: true
            },
            title: {
                type: 'plain_text',
                text: 'Openpowerlifting Bot'
            },
            blocks: [
                {
                    type: 'section',
                    block_id: 'entrydialog_radiobuttons',
                    text: {
                        type: 'mrkdwn',
                        text: 'Please choose the action you want to take'
                    },
                    accessory: {
                        type: 'radio_buttons',
                        action_id: 'entrydialog_radiobuttons',
                        options: [
                            {
                                text: {
                                    type: 'plain_text',
                                    text: 'Last Meet',
                                    emoji: true
                                },
                                value: commandLastmeet
                            },
                            {
                                text: {
                                    type: 'plain_text',
                                    text: 'Best Meet',
                                    emoji: true
                                },
                                value: commandBestmeet
                            },
                            {
                                text: {
                                    type: 'plain_text',
                                    text: 'Compare',
                                    emoji: true
                                },
                                value: commandCompare
                            },
                            {
                                text: {
                                    type: 'plain_text',
                                    text: 'Meet Link',
                                    emoji: true
                                },
                                value: commandMeetlink
                            },
                            {
                                text: {
                                    type: 'plain_text',
                                    text: 'Ranking by criteria',
                                    emoji: true
                                },
                                value: commandRanking
                            }
                        ]
                    }
                },
                {
                    type: 'section',
                    block_id: 'entrydialog_conversations_select',
                    text: {
                        type: 'mrkdwn',
                        text: 'And the conversation you want to post to'
                    },
                    accessory: {
                        type: 'conversations_select',
                        placeholder: {
                            type: 'plain_text',
                            text: 'Select conversation',
                            emoji: true
                        },
                        action_id: 'entrydialog_conversations_select' //,
                        //response_url_enabled: true
                    }
                }
            ]
        }
    },

    lastmeetSubView: [
        {
            type: 'divider'
        },
        {
            type: 'input',
            element: {
                type: 'plain_text_input',
                action_id: 'lastmeet_person_input',
                placeholder: {
                    type: 'plain_text',
                    text: 'Firstname Lastname [#]',
                    emoji: true
                }
            },
            label: {
                type: 'plain_text',
                text: 'Person',
                emoji: true
            }
        }
    ],

    bestmeetSubView: [
        {
            type: 'divider'
        },
        {
            type: 'input',
            element: {
                type: 'plain_text_input',
                action_id: 'bestmeet_person_input',
                placeholder: {
                    type: 'plain_text',
                    text: 'Firstname Lastname [#]',
                    emoji: true
                }
            },
            label: {
                type: 'plain_text',
                text: 'Person',
                emoji: true
            }
        },
        {
            type: 'section',
            text: {
                type: 'mrkdwn',
                text: 'By criteria'
            },
            accessory: {
                type: 'static_select',
                action_id: 'bestmeet_criteria_input',
                initial_option: {
                    text: {
                        type: 'plain_text',
                        text: 'Dots',
                        emoji: true
                    },
                    value: 'dots'
                },
                options: [
                    {
                        text: {
                            type: 'plain_text',
                            text: 'Total',
                            emoji: true
                        },
                        value: 'total'
                    },
                    {
                        text: {
                            type: 'plain_text',
                            text: 'Wilks',
                            emoji: true
                        },
                        value: 'wilks'
                    },
                    {
                        text: {
                            type: 'plain_text',
                            text: 'Dots',
                            emoji: true
                        },
                        value: 'dots'
                    }
                ]
            }
        }
    ],

    compareSubView: [
        {
            type: 'divider'
        },
        {
            type: 'input',
            element: {
                type: 'plain_text_input',
                action_id: 'compare_person1_input',
                placeholder: {
                    type: 'plain_text',
                    text: 'Firstname Lastname [#]',
                    emoji: true
                }
            },
            label: {
                type: 'plain_text',
                text: 'Person 1',
                emoji: true
            }
        },
        {
            type: 'input',
            element: {
                type: 'plain_text_input',
                action_id: 'compare_person2_input',
                placeholder: {
                    type: 'plain_text',
                    text: 'Firstname Lastname [#]',
                    emoji: true
                }
            },
            label: {
                type: 'plain_text',
                text: 'Person 2',
                emoji: true
            }
        },
        {
            type: 'section',
            text: {
                type: 'mrkdwn',
                text: 'By criteria'
            },
            accessory: {
                type: 'static_select',
                action_id: 'compare_criteria_input',
                initial_option: {
                    text: {
                        type: 'plain_text',
                        text: 'Dots',
                        emoji: true
                    },
                    value: 'dots'
                },
                options: [
                    {
                        text: {
                            type: 'plain_text',
                            text: 'Total',
                            emoji: true
                        },
                        value: 'total'
                    },
                    {
                        text: {
                            type: 'plain_text',
                            text: 'Wilks',
                            emoji: true
                        },
                        value: 'wilks'
                    },
                    {
                        text: {
                            type: 'plain_text',
                            text: 'Dots',
                            emoji: true
                        },
                        value: 'dots'
                    }
                ]
            }
        }
    ],

    top10SubView: [
        {
            type: 'divider'
        },
        {
            type: 'input',
            element: {
                type: 'plain_text_input',
                action_id: 'top10_meet_input',
                placeholder: {
                    type: 'plain_text',
                    text: 'optional',
                    emoji: true
                }
            },
            label: {
                type: 'plain_text',
                text: 'Meet Name',
                emoji: true
            }
        },
        {
            type: 'section',
            text: {
                type: 'mrkdwn',
                text: 'Compare method'
            },
            accessory: {
                type: 'static_select',
                action_id: 'top10_comparemethod_input',
                initial_option: {
                    text: {
                        type: 'plain_text',
                        text: 'Dots',
                        emoji: true
                    },
                    value: 'dots'
                },
                options: [
                    {
                        text: {
                            type: 'plain_text',
                            text: 'Total',
                            emoji: true
                        },
                        value: 'total'
                    },
                    {
                        text: {
                            type: 'plain_text',
                            text: 'Wilks',
                            emoji: true
                        },
                        value: 'wilks'
                    },
                    {
                        text: {
                            type: 'plain_text',
                            text: 'Dots',
                            emoji: true
                        },
                        value: 'dots'
                    }
                ]
            }
        },
        {
            type: 'section',
            text: {
                type: 'mrkdwn',
                text: 'Gender'
            },
            accessory: {
                type: 'static_select',
                action_id: 'top10_gender_input',
                placeholder: {
                    type: 'plain_text',
                    text: 'optional',
                    emoji: true
                },
                options: [
                    {
                        text: {
                            type: 'plain_text',
                            text: 'Male',
                            emoji: true
                        },
                        value: 'm'
                    },
                    {
                        text: {
                            type: 'plain_text',
                            text: 'Female',
                            emoji: true
                        },
                        value: 'f'
                    },
                    {
                        text: {
                            type: 'plain_text',
                            text: 'Mx',
                            emoji: true
                        },
                        value: 'mx'
                    }
                ]
            }
        },
        {
            type: 'section',
            text: {
                type: 'mrkdwn',
                text: 'Tested'
            },
            accessory: {
                type: 'static_select',
                action_id: 'top10_tested_input',
                placeholder: {
                    type: 'plain_text',
                    text: 'optional',
                    emoji: true
                },
                options: [
                    {
                        text: {
                            type: 'plain_text',
                            text: 'Yes',
                            emoji: true
                        },
                        value: 'tested'
                    },
                    {
                        text: {
                            type: 'plain_text',
                            text: 'No',
                            emoji: true
                        },
                        value: 'untested'
                    }
                ]
            }
        }
    ],

    singlemeetResultMessageView: {
        channel: '',
        text: '', // Text in the notification, set in the method
        emoji: true,
        unfurl_links: false,
        blocks: [
            {
                type: 'section',
                text: {
                    type: 'mrkdwn',
                    text: ''
                },
                fields: [
                    {
                        type: 'mrkdwn',
                        text: '*Meet:* BW Meisterschaften 2019'
                    },
                    {
                        type: 'mrkdwn',
                        text: '*Date:* 22.09.2019'
                    }
                ]
            },
            {
                type: 'section',
                fields: [
                    {
                        type: 'mrkdwn',
                        text: '*Categorie:* Juniors'
                    },
                    {
                        type: 'mrkdwn',
                        text: '*Class:* 93 kg'
                    },
                    {
                        type: 'mrkdwn',
                        text: '*Place:* 🥈'
                    },
                    {
                        type: 'mrkdwn',
                        text: '*Dots:* 500'
                    }
                ]
            },
            {
                type: 'section',
                fields: [
                    {
                        type: 'mrkdwn',
                        text: '*Squat:* 255 kg'
                    },
                    {
                        type: 'mrkdwn',
                        text: '*Bench:* 157,5 kg'
                    },
                    {
                        type: 'mrkdwn',
                        text: '*Deadlift:* 262,5 kg'
                    },
                    {
                        type: 'mrkdwn',
                        text: '*Total:* 675 kg'
                    }
                ]
            }
        ]
    },

    compareResultMessageView: {
        channel: '',
        text: 'Comparison of Roy Lotzwik and Simon Oswald', // Text in the notification
        emoji: true,
        unfurl_links: false,
        blocks: [
            {
                type: 'section',
                text: {
                    type: 'mrkdwn',
                    text: 'Comparison of <https://www.openpowerlifting.org/u/roylotzwik|Roy Lotzwik> and <https://www.openpowerlifting.org/u/simondanieloswald|Simon Daniel Oswald>'
                }
            },
            {
                type: 'divider'
            },
            {
                type: 'section',
                text: {
                    type: 'mrkdwn',
                    text: '*Roy Lotzwik* personal best:'
                },
                fields: [
                    {
                        type: 'mrkdwn',
                        text: '*Date:* 22.09.2019'
                    },
                    {
                        type: 'mrkdwn',
                        text: '*Bodyweight:* 90,5 kg'
                    },
                    {
                        type: 'mrkdwn',
                        text: '*Dots:* 435,24'
                    },
                    {
                        type: 'mrkdwn',
                        text: '*Total:* 675 kg'
                    }
                ]
            },
            {
                type: 'section',
                fields: [
                    {
                        type: 'mrkdwn',
                        text: '*Squat:* 255 kg'
                    },
                    {
                        type: 'mrkdwn',
                        text: '*Bench:* 157,5 kg'
                    },
                    {
                        type: 'mrkdwn',
                        text: '*Deadlift:* 262,5 kg'
                    }
                ]
            },
            {
                type: 'divider'
            },
            {
                type: 'section',
                text: {
                    type: 'mrkdwn',
                    text: '*Simon Daniel Oswald* personal best:'
                },
                fields: [
                    {
                        type: 'mrkdwn',
                        text: '*Date:* 22.09.2019'
                    },
                    {
                        type: 'mrkdwn',
                        text: '*Bodyweight:* 98,1 kg'
                    },
                    {
                        type: 'mrkdwn',
                        text: '*Dots:* 364,59'
                    },
                    {
                        type: 'mrkdwn',
                        text: '*Total:* 587,5 kg'
                    }
                ]
            },
            {
                type: 'section',
                fields: [
                    {
                        type: 'mrkdwn',
                        text: '*Squat:* 210 kg'
                    },
                    {
                        type: 'mrkdwn',
                        text: '*Bench:* 132,5 kg'
                    },
                    {
                        type: 'mrkdwn',
                        text: '*Deadlift:* 245 kg'
                    }
                ]
            },
            {
                type: 'divider'
            },
            {
                type: 'section',
                text: {
                    type: 'mrkdwn',
                    text: '*Roy Lotzwik wins by 82,5kg Total!*'
                }
            }
        ]
    }
}
