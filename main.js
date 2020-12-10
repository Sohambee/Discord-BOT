const Discord = require('discord.js');

const client = new Discord.Client();

const prefix = '.';

const fs = require('fs');

client.commands = new Discord.Collection();

const commandFiles = fs.readdirSync('./commands/').filter(file => file.endsWith('.js'));

for(const file of commandFiles) {
    const command = require(`./commands/${file}`);
    client.commands.set(command.name, command);
}

client.once('ready', () => {
    console.log('96.BOT is now online!');
})

client.on('message', message => {
    if(!message.content.startsWith(prefix) || message.author.bot) return;

    let args = message.content.substring(prefix.length).split(" ");

    if (args[0] == 'play') {
        client.commands.get('play').execute(message, args);
    } 

    if (args[0] == 'skip') {
        client.commands.get('play').execute(message,args);
    }

    if (args[0] == 'q') {
        client.commands.get('play').execute(message,args);
    }
})

client.login('Nzg1NzM1ODMxNzI5ODY0NzQ1.X88LhA.AwtGr0P4Pco-smsZ94YjZ-9x_FE');