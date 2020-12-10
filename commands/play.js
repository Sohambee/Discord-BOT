const { Channel } = require("discord.js")
const Discord = require("discord.js");
const { getInfo } = require("ytdl-core");

const ytdl = require("ytdl-core");
const servers = {};
var connected = false;

module.exports = {
    name: 'play',
    description: "This command plays a video from Youtube",
    execute(message, args) {


        function play(connection, message) {
            var server = servers[message.guild.id];

            server.dispatcher = connection.play(ytdl(server.queue[0], { filter: "audioonly" }));
            connected = true;

            server.dispatcher.on("finish", function () {
                server.queue.shift();
                if (server.queue[0]) {
                    play(connection, message);
                } else {
                    connection.disconnect();
                    connected = false;
                }
            });
        }

        if (!message.member.voice.channel) {
            message.channel.send("You must be in a voice channel!");
            return;
        }

        var server = servers[message.guild.id];

        if (!servers[message.guild.id]) servers[message.guild.id] = {
            queue: []
        }

        if (args[0] == 'play') {
            if (!args[1]) {
                message.channel.send("Please provide a valid link!");
                return;
            }

            var server = servers[message.guild.id];
            server.queue.push(args[1]);

            if (!message.member.voice.connection) message.member.voice.channel.join().then(function (connection) {
                if (!server.queue[1]) {
                    play(connection, message);
                }
                console.log(connected);
                console.log(server.queue);
            })
        } else if (args[0] == 'skip') {
            if (!message.member.voice.connection && connected) message.member.voice.channel.join().then(function (connection) {
                server.queue.shift();
                if (server.queue[0]) {
                    play(connection, message);
                } else {
                    connection.disconnect();
                    connected = false;
                    message.channel.send("Queue is empty!");
                }
            }); else {
                message.channel.send("Queue is empty!");
            }
        } else if (args[0] == 'q') {
            console.log("q works");
            var length = server.queue.length;
            async function queue() {
                var queue = "Music Queue:\n"
                var msg = await message.channel.send('Fetching queue info');

                for (var i = 0; i < length; i++) {
                    var info = await ytdl.getInfo(server.queue[i]);
                    var songTitle = info.title;
                    message.channel.send(songTitle);
                    queue += `${i + 1}. ${songTitle}\n`;
                }
                msg.edit(queue); 
            }
            queue();
            
        }
    }
}
