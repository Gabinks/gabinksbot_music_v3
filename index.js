const { Client, MessageEmbed } = require('discord.js')
const { prefix } = require('./config.json')
require('dotenv').config()
const Distube = require('distube').default
const { SpotifyPlugin } = require('distube-spotify')
const { SoundCloudPlugin } = require('@distube/soundcloud')
const { YtDlpPlugin } = require('@distube/yt-dlp')

var server_port = rocess.env.PORT;
var server_host = '0.0.0.0';
server.listen(server_port, server_host, function() {
    console.log('Listening on port %d', server_port);
});

const client = new Client({
    intents: ['GUILDS', 'GUILD_MESSAGES', 'GUILD_VOICE_STATES']
})

const distube = new Distube(client, {
    emitNewSongOnly: false,
    leaveOnEmpty: false,
    leaveOnFinish: false,
    leaveOnStop: true,
    savePreviousSongs: true,
    searchSongs: 0,
    searchCooldown: 0,
    plugins: [
        new SpotifyPlugin({
            emitEventsAfterFetching: true,
        }),
        new SoundCloudPlugin(),
        new YtDlpPlugin()
    ],
    youtubeDL: false
});

client.on('ready', async => {
    console.log(`bot is online`)
    client.user.setActivity({
        name: '!help',
        type: 'LISTENING'
    });

    require("./events")(client, distube)
});

client.on('messageCreate', async message => {
    if (message.author.bot || !message.guild) return
    let args = message.content.slice(prefix.length).trim().split(/ +/)
    let cmd = args.shift().toLowerCase()

    let queue = distube.getQueue(message)
    switch (cmd) {
        case "ping":
            {
                message.reply(`pong!`)
            }
            break;
        case "play":
            {
                let song = args.join(' ')
                let voiceChannel = message.member.voice.channel
                if (!voiceChannel) {
                    return message.reply(`**Please join a voice channel first!**`)
                } else if (!song) {
                    return message.reply(`**Please specify a song/link!**`)
                } else {
                    distube.play(voiceChannel, song, {
                        member: message.member,
                        message: message,
                        textChannel: message.channel,
                    });
                }
            }
            break;
        case "playskip":
            {
                let song = args.join(' ')
                let voiceChannel = message.member.voice.channel
                if (!voiceChannel) {
                    return message.reply(`**Please join a voice channel first!**`)
                } else if (!song) {
                    return message.reply(`**Please specify a song/link!**`)
                } else {
                    distube.play(voiceChannel, song, {
                        member: message.member,
                        message: message,
                        textChannel: message.channel,
                        skip: true
                    });
                }
            }
            break;
        case "skip":
            {
                let voiceChannel = message.member.voice.channel
                if (!voiceChannel) {
                    return message.reply(`**Please join a voice channel first!**`);
                } else if (!queue) {
                    return message.reply(`**There is no song playing!**`);
                } else {
                    queue.skip().then((s) => {
                        message.reply(`**Skipped**`);
                    });
                }
            }
            break;
        case "stop":
            {
                let voiceChannel = message.member.voice.channel
                if (!voiceChannel) {
                    return message.reply(`**Please join a voice channel first!**`);
                } else if (!queue) {
                    return message.reply(`**There is no song playing!**`);
                } else {
                    queue.stop().then((s) => {
                        message.reply(`**Stopped**`);
                    });
                }
            }
            break;
        case "pause":
            {
                let voiceChannel = message.member.voice.channel
                if (!voiceChannel) {
                    return message.reply(`**Please join a voice channel first!**`);
                } else if (!queue) {
                    return message.reply(`**There is no song playing!**`);
                } else if (queue.paused) {
                    return message.reply(`**Already paused**`);
                }
                else {
                    queue.pause();
                    message.reply(`**Paused**`);
                }
            }
            break;
        case "resume":
            {
                let voiceChannel = message.member.voice.channel
                if (!voiceChannel) {
                    return message.reply(`**Please join a voice channel first!**`);
                } else if (!queue) {
                    return message.reply(`**There is no song playing!**`);
                } else if (!queue.paused) {
                    return message.reply(`**Already resumed**`);
                }
                else {
                    queue.resume();
                    message.reply(`**Resumed**`);
                }
            }
            break;
        case "volume":
            {
                let voiceChannel = message.member.voice.channel
                let volume = Number(args[0])
                if (!voiceChannel) {
                    return message.reply(`**Please join a voice channel first!**`);
                } else if (!queue) {
                    return message.reply(`**There is no song playing!**`);
                } else if (!volume) {
                    return message.reply(`**Please provide volume number**`);
                }
                else {
                    queue.setVolume(volume);
                    message.reply(`**Volume changed to \`${queue.volume}%\` **`);
                }
            }
            break;
        case "queue":
            {
                let voiceChannel = message.member.voice.channel
                if (!voiceChannel) {
                    return message.reply(`**Please join a voice channel first!**`);
                } else if (!queue) {
                    return message.reply(`**There is no song playing!**`);
                } else {
                    let songs = queue.songs.slice(0, 10).map((song, index) => {
                        return `\`${index + 1}\` [\`${song.name}\`](${song.url}) [${song.formattedDuration}]`
                    }).join('\n')

                    message.reply({
                        embeds: [
                            new MessageEmbed()
                                .setColor('BLURPLE')
                                .setTitle(`**Queue of ${message.guild.name}**`)
                                .setDescription(songs)
                                .setFooter({
                                    text: `Requested by ${message.author.tag}`
                                }),
                        ],
                    });
                }
            }
            break;
        case "loop":
            {
                let voiceChannel = message.member.voice.channel
                let loopmode = args[0]
                let mods = ['song', 'queue', 'off']
                if (!voiceChannel) {
                    return message.reply(`**Please join a voice channel first!**`);
                } else if (!queue) {
                    return message.reply(`**There is no song playing!**`);
                } else if (!mods.includes(loopmode)) {
                    return message.reply(`**Wrong usage \n > ${mods.join(" , ")}**`);
                }
                else {
                    if (loopmode === "song") {
                        queue.setRepeatMode(1)
                        message.reply(`**Loop mode set to \`${loopmode}\`**`);
                    } else if (loopmode === "queue") {
                        queue.setRepeatMode(2)
                        message.reply(`**Loop mode set to \`${loopmode}\`**`);
                    } else if (loopmode === "off") {
                        queue.setRepeatMode(0)
                        message.reply(`**Loop mode set to \`${loopmode}\`**`);
                    }
                }
            }
            break;
        default:
            break;
    }
});

client.login(process.env.TOKEN)