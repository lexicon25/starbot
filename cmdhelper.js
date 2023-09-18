/* cmdhelper.js
 * starbot
 * by Lexicon25
 * 
 * useful helper functions/variables specifically for commands.
 */

const { ComponentType, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");

// prevNextButtons (number) => ActionRowBuilder
// makes a row of buttons "previous and next".
function prevNextButtons(pmax) {
    const row = new ActionRowBuilder().addComponents(
        new ButtonBuilder().setCustomId('prev').setLabel('Previous').setStyle(ButtonStyle.Secondary),
        new ButtonBuilder().setCustomId('next').setLabel('Next').setStyle(ButtonStyle.Primary),
    );
    if (pmax == 1) {
        row.components[0].setDisabled(true);
        row.components[1].setDisabled(true);
    }

    return row;
}

// createButtonCollector (interaction) => MessageComponentCollctor
// makes a button collector that lasts for WAIT_TIME.
const createButtonCollector = async(interaction) => {
    const WAIT_TIME = 90000;

    if (interaction.inGuild()) {
        return await interaction.channel.createMessageComponentCollector({
            componentType: ComponentType.Button,
            time: WAIT_TIME
        });
    } else {
        const channel = await interaction.client.channels.fetch(interaction.channelId);
        return await channel.createMessageComponentCollector({
            componentType: ComponentType.Button,
            time: WAIT_TIME
        });
    }
}

// activateButton (interaction, interaction, ActionRow, Embed, function, args) => any
// performs a command function if a button is pressed by the user that sent the command
const activateButton = async(originalInt, newInt, row, embed, cmdFunction, ...args) => {
    message = await originalInt.fetchReply();
    var SAME_MESSAGE = message['id'] === newInt.message['id'];
    var SAME_USER_ID = originalInt.user.id === newInt.user.id;

    if (SAME_MESSAGE && SAME_USER_ID) {
        results = await cmdFunction(args.concat(newInt));
        embed = results[0];

        await originalInt.editReply({ embeds: [embed], components: [row] })
            .then(() => {
                console.log(`Button pressed.`)
            })
            .catch(console.error);

        return results;
    }
}

// expireButton (ActionRow, Embed) => void
// disables buttons and does final edit of embed
function expireButton(originalInt, row, embed) {
    row.components[0].setDisabled(true);
    if (row.components[1] != undefined) {
        row.components[1].setDisabled(true);
    }

    originalInt.fetchReply()
    .then(() => {
        originalInt.editReply({ embeds: [embed], components: [row] })
    })
    .catch(console.log(`Time expired for a command`));
}

module.exports = {
    prevNextButtons: prevNextButtons,
    createButtonCollector: createButtonCollector,
    activateButton: activateButton,
    expireButton: expireButton,
}