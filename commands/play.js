const { Channel } = require("discord.js")
const Discord = require("discord.js");
const { getInfo } = require("ytdl-core");

const ytdl = require("ytdl-core");
const { execute } = require("./ping");
const servers = {};
var connected = false;

module.exports = {
    name: 'play',
    description: "This command plays a video from Youtube.",
    execute(message, args) {
        function play(connection, message) {
            var server = servers[message.guild.id];

            server.dispatcher = connection.play(ytdl(server.queue[0], { filter: "audioonly", quality: 'highestaudio' }));
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
            message.reply("you must be in a voice channel!");
            return;
        }

        var server = servers[message.guild.id];

        if (!servers[message.guild.id]) servers[message.guild.id] = {
            queue: []
        }

        if (args[0] == 'play' || args[0] == 'p') {
            var link = "https://www.youtube.com/";

            if (!args[1]) {
                message.reply("please provide a valid link!");
                return;
            }

            if (args[1].includes(link)) {
                async function delMessage() {
                    message.delete();
                    var linkInput = await ytdl.getInfo(args[1]);
                    var songTitle = JSON.stringify(linkInput.videoDetails.title);
                    var songURL = linkInput.videoDetails.video_url;
                    var send = `${songTitle} - <${songURL}> - by ${message.member}\n`
                    message.channel.send('**ADDED TO QUEUE:** ' + send);
                }

                delMessage();

                var server = servers[message.guild.id];
                server.queue.push(args[1]);

                if (!message.member.voice.connection) message.member.voice.channel.join().then(function (connection) {
                    if (!server.queue[1]) {
                        play(connection, message);
                    }
                })
            } else {
                var search = require('youtube-search');
                var opts = {
                    maxResults: 5,
                    key: 'AIzaSyChYNbaGJ8cVAPNvhTyAlZMH1afSxetriI',
                    type: 'video'
                };
                search(args[1], opts, function (err, results) {
                    if (err) return console.log(err);
                    var send = "**SEARCH RESULTS**:\n";
                    for (var i = 0; i < results.length; i++) {
                        send += `${i + 1}. ${results[i].title}\n`;
                    }
                    message.channel.send(send);
                });
            }

        } else if (args[0] == 'skip' || args[0] == 's') {
            var removal = parseInt(args[1]);
            message.delete();

            async function removeSongNum() {

                var removeInfo = await ytdl.getInfo(server.queue[removal - 1]);
                var songTitle = JSON.stringify(removeInfo.videoDetails.title);
                var removed = `${removal}. ${songTitle}: was removed from the queue! - by ${message.member}\n`;

                message.channel.send(removed);
            }

            async function removeSong() {

                var removeInfo = await ytdl.getInfo(server.queue[0]);
                var songTitle = JSON.stringify(removeInfo.videoDetails.title);
                var removed = `1. ${songTitle}: was removed from the queue! - by ${message.member}\n`;

                message.channel.send(removed);
            }

            if (Number.isInteger(removal) && removal != 1 && server.queue[removal - 1]) {
                removeSongNum();
                server.queue.splice(removal - 1, 1);
            } else if (!args[1] || removal == 1) {
                if (!message.member.voice.connection && connected) message.member.voice.channel.join().then(function (connection) {
                    removeSong();
                    server.queue.shift();
                    if (server.queue[0]) {
                        play(connection, message);
                    } else {
                        connection.disconnect();
                        connected = false;
                        message.reply("queue is empty!");
                    }
                }); else {
                    message.reply("queue is empty!");
                }
            }
        } else if (args[0] == 'queue' || args[0] == 'q') {
            message.delete();
            var server = servers[message.guild.id];
            var length = server.queue.length;

            if (server.queue.length != 0) {
                async function queue() {
                    var queue = "**MUSIC QUEUE**:\n"
                    var msg = await message.channel.send('*Fetching queue info*');

                    for (var i = 0; i < length; i++) {
                        var info = await ytdl.getInfo(server.queue[i]);
                        var songTitle = JSON.stringify(info.videoDetails.title);
                        var songURL = info.videoDetails.video_url;
                        queue += `${i + 1}. ${songTitle} - <${songURL}>\n`;
                    }
                    msg.edit(queue);
                }
                queue();
            } else {
                message.reply("queue is empty!")
            }
        }
    }
}
