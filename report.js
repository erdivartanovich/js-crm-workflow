var IncomingWebhook = require('@slack/client').IncomingWebhook;

var url = process.env.SLACK_WEBHOOK_URL || ''; //see section above on sensitive data
const report = require('./coverage/coverage-summary.json').total
var webhook = new IncomingWebhook(url, {
  username: 'JS Code Coverage',
  iconEmoji: ':golfer:',
  channel: 'activities'
});

webhook.send({
    text: 'Code coverage result',
    "attachments": [
		{
            "color": "#36a64f",
            "title": "Code Coverage",
            "fields": [
                {
                    "title": "Lines",
                    "value": `${report.lines.pct}%`,
                    "short": true
                },
                {
                    "title": "Statements",
                    "value": `${report.statements.pct}%`,
                    "short": true
                },
                {
                    "title": "Branches",
                    "value": `${report.branches.pct}%`,
                    "short": true
                },
                {
                    "title": "Functions",
                    "value": `${report.functions.pct}%`,
                    "short": true
                }
            ],
            "footer": "Refactory",
            "footer_icon": "https://refactory.id/images/Refactory-icon.png",
            "ts": new Date().getTime(),
        }
    ]
})