const { Channel } = require("discord.js")

module.exports = {
    name: 'clear',
    description: "This is a chat clear-command.",
    execute(message) { 
        if (message.member.hasPermission('ADMINISTRATOR', { checkAdmin: true })) {
            message.channel.messages.fetch().then(function(list) {
                message.channel.bulkDelete(list);
                message.channel.send(`CHAT WAS CLEARED BY - ${message.member}`)
            }, function(err) { message.reply("Could not delete messages!")});
        }
    }
}