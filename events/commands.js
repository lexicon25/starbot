/* events/commands.js
 * starbot
 * by Lexicon25
 * 
 * interactionCreate event for commands
 */

// requires
const { Events } = require('discord.js');

module.exports = {
    name: Events.InteractionCreate,

    async execute(interaction) {
        if (!interaction.isChatInputCommand()){
            return;
        }

        const command = interaction.client.commands.get(interaction.commandName);

        if (!command) {
            console.error(`No command matching ${interaction.commandName} was found`);
            return;
        }

        try {
            await command.execute(interaction);
        } catch (error) {
            console.error(error);

            await interaction.reply({
                content: `There was an error executing this command!`,
                ephemeral: true,
            });
        }
    },
};