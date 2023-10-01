/* commands/trueladder.js
 * starbot
 * by Lexicon25
 * 
 * gives levels for True Ladder Pack
 */

// requires
const axios = require('axios');
const helper = require('./../helper.js');
const commandHelper = require('./../cmdhelper.js');
const fs = require('fs');
const path = require('path');
const { md5, crc32 } = require('hash-wasm');
const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

const shapes = ['🟩', '🔺', '💜', '⭐', '🔵'];
const mod = (n,m) => (n % m + m) % m;

// ladderQuery (integer, integer) => array
// gets true ladder pack levels (unfiltered)
const ladderQuery = async(tier, page) => {
    var url = `https://gdladder.com/api/level/search?chunk=50&page=${page}`;
    if (tier != 0) {
        url += `&lowTier=${tier}&highTier=${tier}&removeUnrated=true&removeRated=false`;
    } else {
        url += `removeUnrated=false&removeRated=true`;
    }
    url += `&removeUnratedEnj=false&removeRatedEnj=false&sort=level-id&sortDirection=asc`;
    try {
        const query = await axios.get(url);

        console.log('doing query');

        return query['data'];
    } catch (error) {
        console.error(error);
    }
}

// createLadderEmbed (Embed, array, integer, integer) => void
// constructs the main embed based on the page
function createLadderEmbed(trueEmbed, ladderLevels, curPage, maxPage) {
    var str = '';
    var levelIndex = curPage * 10;
    if (ladderLevels.length < levelIndex) {
        levelIndex = ladderLevels.length;
    }

    for (var i = (curPage-1) * 10; i < levelIndex; i++) {
        str += `${ladderLevels[i]['Name']} by ${ladderLevels[i]['Creator']} (${ladderLevels[i]['LevelID']})\n`;
    }
    trueEmbed.setDescription(str);

    if (trueEmbed.length > 10) {
        trueEmbed.setFooter({ text: `Page ${curPage} of ${maxPage}` });
    }
}

// trueLadderCommand (array) => array
// creates a new /trueladder embed.
const trueLadderCommand = async (arr) => {
    // arr: [trueLevels, tier, shape, curPage, maxPage, null]
    var trueEmbed = new EmbedBuilder();
    if (arr[1] != null) {
        trueEmbed.setColor(helper.diffHex[arr[1]-1]);
    } else {
        trueEmbed.setColor(0xCCCCCC);
    }
    var curPage = arr[3];

    if (arr[5] != null) {
        if (arr[5].customId == 'next') {
            curPage = (curPage+1) % arr[4] || arr[4];
        } else {
            curPage = (curPage-1) % arr[4] || arr[4];
        }
    }

    trueEmbed.setTitle(`Possible Tier ${arr[1]} demons to select for ${shapes[arr[2]]} are:`);

    createLadderEmbed(trueEmbed, arr[0], curPage, arr[4]);

    return [trueEmbed, curPage];
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName('trueladder')
        .setDescription('Gives possible level choices for True Ladder Pack')
        .addIntegerOption(option =>
            option.setName('tier')
            .setDescription('The tier you want levels from')
            .setMinValue(0)
            .setMaxValue(35)
            .setRequired(true)
        )
        .addIntegerOption(option =>
            option.setName('shape')
            .setDescription('Your chosen shape')
            .setRequired(true)
            .addChoices(
                { name: '🟩', value: 0 },
                { name: '🔺', value: 1 },
                { name: '💜', value: 2 },
                { name: '⭐', value: 3 },
                { name: '🔵', value: 4 },
            )
        ),

    async execute(interaction) {
        const tier = interaction.options.getInteger('tier');
        const shape = interaction.options.getInteger('shape');

        var trueEmbed = new EmbedBuilder();
        if (tier != 0) {
            trueEmbed.setColor(helper.diffHex[tier-1]);
        } else {
            trueEmbed.setColor(0xCCCCCC);
        }

        await interaction.deferReply();

        console.log(`recieved /trueladder tier: ${tier} shape: ${shapes[shape]}`);

        var unlocks = [];
        var text = fs.readFileSync(path.resolve(__dirname, '../unlocks.txt'), "utf-8");
        text.split('\n').forEach(elem => unlocks.push(elem.split("")));

        if (unlocks[tier][shape] == 0) {
            trueEmbed.setTitle(`Tier ${tier} is LOCKED for ${shapes[shape]}!`);
            await interaction.editReply({ embeds: [trueEmbed], components: [] })
                .then(() => { console.log(`true ladder pack LOCKED`) })
                .catch(console.error);
            return;
        }

        // filter down levels from current list
        var curPage = 1;
        var query = await ladderQuery(tier, 1);
        var maxPage = Math.ceil(query['total'] / 50);
        var ladderLevels = query['levels'];

        var queries = [];

        while (curPage != maxPage) {
            queries.push(ladderQuery(tier, curPage+1));
            curPage++;
        }
        curPage = 1;

        var result = await Promise.all(queries);

        for (elem of result) {
            ladderLevels = ladderLevels.concat(elem['levels']);
        }

        var trueLevels = [];

        for (const lvl of ladderLevels) {
            var enc1 = await md5(lvl['LevelID'].toString());
            enc1 = enc1.concat("25");
            var enc2 = await crc32(enc1);
            var PASS = mod(parseInt(enc2,16),5) == mod((shape+1+(tier-1)), 5);
            if (PASS) {
                trueLevels = trueLevels.concat([lvl]);
            }
        }

        maxPage = Math.ceil(trueLevels.length / 10);

        var results = await trueLadderCommand([trueLevels, tier, shape, curPage, maxPage, null]);
        var trueEmbed = results[0];
        curPage = results[1];

        const row = commandHelper.prevNextButtons(maxPage);
        await interaction.editReply({ embeds: [trueEmbed], components: [row] })
            .then(() => { console.log(`a true ladder pack request was sent.`) } )
            .catch(console.error);
        var collector = await commandHelper.createButtonCollector(interaction);
        collector.on('collect', async (i) => {
            results = await commandHelper.activateButton(interaction, i, row, trueEmbed, trueLadderCommand, trueLevels, tier, shape, curPage, maxPage, i);
            curPage = results[1];
        });
        collector.on('end', () => {
            commandHelper.expireButton(interaction, row, dynamicEmbed);
        });
    }
}