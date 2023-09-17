/* commands/bean.js
 * starbot
 * by Lexicon25
 * 
 * modelled after g!bean from LadderBot (RFMX)
 * Beans a user
 */

// requires
const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('bean')
        .setDescription('Beans')
        .addUserOption(option =>
            option.setName('user')
            .setDescription('The user to bean')
            .setRequired(true)
        )
        .addStringOption(option =>
            option.setName('reason')
            .setDescription('The reason to bean the user')
        ),

    async execute(interaction) {
        const user = interaction.options.getUser('user');
        var reason = interaction.options.getString('reason') ?? `No reason provided.`;

        const guild = interaction.guild;
        const channels = guild.channels.cache.filter(x => x.isTextBased());

        console.log(`received /bean user: ${user.toString()} reason: ${reason}`);

        const filter = m => m.author.id === user.id;

        var BEANED = false;
        const BEAN_TIME = 3600000;

        channels.forEach( (channel) => {
            channel.awaitMessages({
                filter,
                max: 1,
                time: BEAN_TIME,
                errors: ['time']
            })
            .then( (collected) => {
                if (!BEANED) {
                    BEANED = true;

                    collected.forEach(elem => elem.react('<:mrbean:924691487269203978>'));
                }
            })
            .catch(console.error);
        });

        await interaction.reply(`<:yes_tick:744780635641610240> ${user.username} was beaned. Reason: ${reason}`);
    }
}