// file with everything for slack interactions
const slack_views = require('./slack_views')

//functions
const commandDialog = 'openpl'
const commandLastmeet = 'lastmeet'
const commandBestmeet = 'bestmeet'
const commandCompare = 'compare'
const commandMeetlink = 'meetlink'
const commandRanking = 'ranking'

//view builder functions
function getEntryDialog(subviewName) {
    let baseView = JSON.parse(JSON.stringify(slack_views.entryDialogView))
    let subView

    switch (subviewName) {
        case 'lastmeet':
            subView = slack_views.lastmeetSubView
            break
        case 'bestmeet':
            subView = slack_views.bestmeetSubView
            break
        case 'compare':
            subView = slack_views.compareSubView
            break
        case 'top10':
            subView = slack_views.top10SubView
            break
        default:
            return baseView
    }

    baseView.view.blocks = baseView.view.blocks.concat(subView)
    return baseView
}

function getResultMessage(channel, option, data) {
    let resultMessage

    switch (option) {
        case commandLastmeet:
            resultMessage = JSON.parse(
                JSON.stringify(slack_views.singlemeetResultMessageView)
            )
            resultMessage.text = `Last meet of *${data[0].name}*`
            resultMessage.blocks[0].text.text = `Last meet of *${data[0].name}* <https://www.openpowerlifting.org/u/roylotzwik|openpowerlifting.org>`

            resultMessage.blocks[0].fields[0].text = `*Meet:* ${data[0].meetname}`
            resultMessage.blocks[0].fields[1].text = `*Date:* ${data[0].date}`

            resultMessage.blocks[1].fields[0].text = `*Categorie:* ${data[0].division}`
            resultMessage.blocks[1].fields[1].text = `*Class:* ${data[0].weightclasskg}`
            resultMessage.blocks[1].fields[2].text = `*Place:* ${data[0].place}`
            resultMessage.blocks[1].fields[3].text = `*Dots:* ${data[0].dots}`

            resultMessage.blocks[2].fields[0].text = `*Squat:* ${data[0].best3squatkg}`
            resultMessage.blocks[2].fields[1].text = `*Bench:* ${data[0].best3benchkg}`
            resultMessage.blocks[2].fields[2].text = `*Deadlift:* ${data[0].best3deadliftkg}`
            resultMessage.blocks[2].fields[3].text = `*Total:* ${data[0].totalkg}`
            break
        case commandBestmeet:
            resultMessage = JSON.parse(
                JSON.stringify(slack_views.singlemeetResultMessageView)
            )
            resultMessage.text = 'Best meet of *Roy Lotzwik*'
            resultMessage.blocks[0].text.text =
                'Best meet of *Roy Lotzwik* <https://www.openpowerlifting.org/u/roylotzwik|openpowerlifting.org>'
            break
        case commandCompare:
            resultMessage = JSON.parse(
                JSON.stringify(slack_views.compareResultMessageView)
            )
            break
        case commandRanking:
            resultMessage = JSON.parse(
                JSON.stringify(slack_views.singlemeetResultMessageView)
            )
            break
        default:
            resultMessage = JSON.parse(
                JSON.stringify(slack_views.singlemeetResultMessageView)
            )
            break
    }

    resultMessage.channel = channel

    return resultMessage
}

//exports
module.exports = {
    getEntryDialog,
    getResultMessage,
    commandDialog,
    commandLastmeet,
    commandBestmeet,
    commandCompare,
    commandMeetlink,
    commandRanking
}
