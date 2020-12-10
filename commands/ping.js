const { Channel } = require("discord.js")

module.exports = {
    name: 'ping',
    description: "This is a ping command.",
    execute(message) { 
        message.channel.send('pong!');
    }
}
