/* events/buttons.js
 * starbot
 * by Lexicon25
 *
 * interactionCreate event for buttons
 */

// requires
const { Events } = require('discord.js');

module.exports = {
    name: Events.InteractionCreate,
    async execute(interaction) {
        if (!interaction.isButton()) return;

        interaction.deferUpdate();
    }
}