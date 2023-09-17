/* commands/ping.js
 * starbot
 * by Lexicon25
 * 
 * modelled after g!ping from LadderBot (RFMX)
 * pings the bot, who will reply with "Pong!" if the command is successfully receieved.
 */

// requires
const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ping')
        .setDescription('Pings bot.'),

    async execute(interaction) {
        await interaction.reply('Pong!')
            .then(() => console.log('/ping reply sent.'))
            .catch(console.error);
    },
};