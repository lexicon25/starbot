/* commands/message.js
 * starbot
 * by Lexicon25
 * 
 * modelled after g!message from LadderBot (RFMX)
 * sends a message from starbot if you have authorization
 */

// requires
const fs = require('node:fs');
const path = require('node:path');
const { SlashCommandBuilder } = require('discord.js');

var mods = [];
var text = fs.readFileSync(path.resolve(__dirname, '../mods.txt'), 'utf-8');
text.split('\n').forEach(elem => mods.push(elem.trim()));

module.exports = {
    data: new SlashCommandBuilder()
        .setName('message')
        .setDescription('Sends a message from starbot')
        .addStringOption(option =>
            option.setName('message')
            .setDescription('The message you want to send')
            .setRequired(true)
        )
        .addChannelOption(option =>
            option.setName('channel')
            .setDescription('The channel you want starbot to send in')
        ),

    async execute(interaction) {
        const message = interaction.options.getString('message');
        const channel = interaction.options.getChannel('channel') ?? interaction.channel;

        if (mods.includes(interaction.user.id.toString())) {
            await channel.send(message)
                .then(() => {
                    interaction.reply({
                        content: 'Messsage sent! (hopefully)',
                        ephemeral: true,
                    });
                })
                .catch(console.error);
        } else {
            await interaction.reply({
                content: `You don't have the permissions to send a message with starbot!`,
                ephemeral: true,
            });
        }
    }
};