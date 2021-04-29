// file with everything for slack interactions

//views
const entryMessageView = {
    channel: "",
    text: "You mentioned me in your message, do you want to start a lookup?",
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
                    style: "primary",
					value: "click_me_123"
				},
				{
					type: "button",
					text: {
						type: "plain_text",
						text: "Yes and delete my message",
						emoji: true
					},
                    action_id: "entrymessage_start_delete_usermessage",
					value: "click_me_123"
				},
				{
					type: "button",
					text: {
						type: "plain_text",
						text: "No",
						emoji: true
					},
                    action_id: "entrymessage_cancel",
					value: "click_me_123"
				}
			]
		}
    ]
};

const entryView = {
    trigger_id: '',
        view: {
            type: "modal",
            title: {
                type: "plain_text",
                text: "Openpowerlifting Bot"
            },
            blocks: [
                {
                    type: "section",
                    text: {
                        type: "mrkdwn",
                        text: "Please choose the action you want to take"
                    }
                },
                {
                    type: "actions",
                    elements: [
                        {
                            type: "button",
                            text: {
                                type: "plain_text",
                                text: "Last meet",
                                emoji: true
                            },
                            value: "click_me_123",
                            action_id: "actionId-0"
                        },
                        {
                            type: "button",
                            text: {
                                type: "plain_text",
                                text: "Best Meet",
                                emoji: true
                            },
                            value: "click_me_123",
                            action_id: "actionId-1"
                        },
                        {
                            type: "button",
                            text: {
                                type: "plain_text",
                                text: "Compare",
                                emoji: true
                            },
                            value: "click_me_123",
                            action_id: "actionId-2"
                        },
                        {
                            type: "button",
                            text: {
                                type: "plain_text",
                                text: "Top 10 by criteria",
                                emoji: true
                            },
                            value: "click_me_123",
                            action_id: "actionId-3"
                        }
                    ]
                }
            ]
        }   
}

//exports
module.exports = {
    sendMessage : function (text, channel) {
        console.log('Test')
    },

    entryView,
    entryMessageView
};