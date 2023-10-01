/* commands/dynamic.js
 * starbot
 * by Lexicon25
 * 
 * gives levels for the Dynamic Pack
 */

// requires
const axios = require('axios');
const helper = require('./../helper.js');
const commandHelper = require('./../cmdhelper.js');
const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

// dynamicQuery (integer, integer) => array
// gets dynamic pack levels (unfiltered)
const dynamicQuery = async(tier, page) => {
    var url = `https://gdladder.com/api/level/search?chunk=50&page=${page}&exactName=false`;
    url += `&removeUnrated=true&removeUnratedEnj=false&removeRated=false&removeRatedEnj=false`;
    url += `&sort=level-id&sortDirection=asc&lowTier=${tier}&highTier=${tier}`;
    try {
        const query = await axios.get(url);

        return query['data'];
    } catch (error) {
        console.error(error);
    }
}

// dynamicCommand (array) => array
// creates a new /dynamic embed.
const dynamicCommand = async (arr) => {
    // arr: [queryResults, tier, num, curPage, maxPage, newInt]
    var dynamicEmbed = new EmbedBuilder().setColor(helper.diffHex[arr[1]-1]);
    dynamicEmbed.setTitle(`Possible Tier ${arr[1]} demons to select for Level ${arr[2]} are:`);

    var curPage = arr[3];
    if (arr[5] != null) {
        if (arr[5].customId == 'next') {
            curPage = (curPage+1) % arr[4] || arr[4];
        } else {
            curPage = (curPage-1) % arr[4] || arr[4];
        }
    }

    var str = '';
    var levelIndex = curPage * 10;
    if (arr[0].length < levelIndex) {
        levelIndex = arr[0].length;
    }

    for (var i = (curPage-1) * 10; i < levelIndex; i++) {
        str += `${arr[0][i]['Name']} by ${arr[0][i]['Creator']} (${arr[0][i]['LevelID']})\n`;
    }
    dynamicEmbed.setDescription(str);

    if (arr[0].length > 10) {
        dynamicEmbed.setFooter({ text: `Page ${curPage} of ${arr[4]}` });
    }

    return [dynamicEmbed, curPage];
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName('dynamic')
        .setDescription('Gives possible level choices for Dynamic Pack.')
        .addIntegerOption(option =>
            option.setName('tier')
            .setDescription('The tier you want levels from')
            .setMinValue(1)
            .setMaxValue(22)
            .setRequired(true)
        )
        .addIntegerOption(option =>
            option.setName('num')
            .setDescription('The pack level number you are at')
            .setMinValue(0)
            .setMaxValue(9)
            .setRequired(true)
        ),

    async execute(interaction) {
        const tier = interaction.options.getInteger('tier');
        const num = interaction.options.getInteger('num');

        console.log(`recieved /dynamic with tier ${tier} with level ${num}`);

        await interaction.deferReply();

        var curPage = 1;
        var query = await dynamicQuery(tier, 1);
        var maxPage = Math.ceil(query['total'] / 50);
        var queryResults = query['levels'];
        var queries = [];

        while (curPage != maxPage) {
            queries.push(dynamicQuery(tier, curPage+1));
            curPage++;
        }
        var results = await Promise.all(queries);
        for (elem of results) {
            queryResults = queryResults.concat(elem['levels']);
        }

        queryResults = queryResults.filter( (level) => level['LevelID'] % 10 == num );
        curPage = 1
        maxPage = Math.ceil(queryResults.length / 10);

        var results = await dynamicCommand([queryResults, tier, num, curPage, maxPage, null]);
        var dynamicEmbed = results[0];
        curPage = results[1];

        const row = commandHelper.prevNextButtons(maxPage);
        await interaction.editReply({ embeds: [dynamicEmbed], components: [row] })
            .then(() => { console.log(`a dynamic pack request was sent.`) } )
            .catch(console.error);
        var collector = await commandHelper.createButtonCollector(interaction);
        collector.on('collect', async (i) => {
            results = await commandHelper.activateButton(interaction, i, row, dynamicEmbed, dynamicCommand, queryResults, tier, num, curPage, maxPage, i);
            curPage = results[1];
        });
        collector.on('end', () => {
            commandHelper.expireButton(interaction, row, dynamicEmbed);
        });
    }
}