const { Client, MessageMentions, MessageEmbed } = require('discord.js')
const { default: Distube } = require('distube')
/**
 * 
 * @param {Client} client 
 * @param {Distube} distube 
 */
module.exports = (client, distube) => {

    distube.on('playSong', async (queue, song) => {
        queue.textChannel.send({
            embeds: [
                new MessageEmbed()
                    .setColor('BLURPLE')
                    .setTitle(`Now Playing`)
                    .setDescription(` [\`${song.name}\`](${song.url}) [${song.user}] `)
            ],
        });
    });

    distube.on('addSong', async (queue, song) => {
        queue.textChannel.send({
            embeds: [
                new MessageEmbed()
                    .setColor('BLURPLE')
                    .setTitle(`Song added in queue`)
                    .setDescription(` [\`${song.name}\`](${song.url}) [${song.user}] `)
            ],
        });
    })

    distube.on('disconnect', async (queue) => {
        queue.textChannel.send({
            embeds: [
                new MessageEmbed()
                    .setColor('BLURPLE')
                    .setDescription(`Discconnected from ${queue.voiceChannel} voice channel`)
            ],
        });
    })
};