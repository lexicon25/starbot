/* commands/level.js
 * starbot
 * by Lexicon25
 * 
 * modelled after g!level from LadderBot (RFMX)
 * retrieves GDDL information about a level.
 */

// requires
const axios = require('axios');
const helper = require('./../helper.js');
const commandHelper = require('./../cmdhelper.js');
const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

// searchQuery (string, string, integer) => array
// searches for levels based on search parameter / creator name
const searchQuery = async(search, creator, page) => {
    var url = `https://gdladder.com/api/level/search?chunk=50&page=${page}`;
    if (search != null) {
        url += `&name=${search}`;
    }
    if (creator != null) {
        url += `&creator=${creator}`;
    }
    try {
        const query = await axios.get(url);

        return query['data'];
    } catch (error) {
        console.error(error);
    }
}

// ratingQuery (integer, integer) => array
// gets ratings of a demon based on its ID.
const ratingQuery = async(id, page) => {
    var url = `https://gdladder.com/api/submissions?levelID=${id}&page=${page}&chunk=50`;
    try {
        const query = await axios.get(url);

        return query['data'];
    } catch (error) {
        console.error(error);
    }
}

// createDemonInfo (Embed, array, integer, integer) => void
// constructs the main demon information in the embed.
function createDemonInfo(levelEmbed, demonInfo, minTier, maxTier) {
    levelEmbed.setTitle(`**Level info for ${demonInfo['Name']} (${demonInfo['LevelID']})**`)
    .addFields(
        { name: `Creator`, value: demonInfo['Creator'], inline: true },
        { name: `Song`, value: demonInfo['Song'], inline: true },
        { name: `Difficulty`, value: `${demonInfo['Difficulty']} Demon ${helper.diffEmotes[demonInfo['Difficulty']]}`, inline: true }
    );

    if (demonInfo['LevelID'] > 100) {
        levelEmbed.setURL(`https://gdbrowser.com/${demonInfo['LevelID']}`);
    }

    var tierValue = 'Unrated <:unrated:940515484967784458>';
    var enjValue = 'Unrated';

    if (demonInfo['Rating'] != null) {
        var tier2dp = (Math.round(demonInfo['Rating'] * 100) / 100).toString();
        var tier = Math.round(demonInfo['Rating']);
        levelEmbed.setColor(helper.diffHex[tier-1]);

        tierValue = `${tier} (${tier2dp}) ${helper.tierEmotes[tier]}`;
    }
    if (demonInfo['Enjoyment'] != null) {
        var enj2dp = (Math.round(demonInfo['Enjoyment'] * 100) / 100).toString();
        var enj = Math.round(demonInfo['Enjoyment']).toString();

        enjValue = `${enj} (${enj2dp}) ${helper.enjoyEmotes[enj]}`;
    }
    levelEmbed.addFields(
        { name: `Tier`, value: tierValue, inline: true },
        { name: `Enjoyment`, value: enjValue, inline: true}
    );

    var str = '';
    if (demonInfo['Deviation'] != null) {
        var dev = (Math.round(demonInfo['Deviation'] * 100000) / 100000).toString();
        str += `Standard Deviation: ${dev}\n`;
    }
    if (minTier != null) {
        str += `Tier Range: ${minTier}`;
        if (minTier != maxTier) {
            str += `-${maxTier}`;
        }
        str += '\n'
    }
    if (str == '') {
        str = 'None';
    }
    levelEmbed.addFields( { name: `Other Info:`, value: str, inline: true } );
}

// createRatingInfo (Embed, array, integer, integer) => void
// constructs the rating information field in levelEmbed
function createRatingInfo(levelEmbed, ratings, curPage, maxPage) {
    var str = '';
    var ratingsIndex = curPage * 10;
    if (ratings.length < ratingsIndex) {
        ratingsIndex = ratings.length;
    }

    for (var i = (curPage-1) * 10; i < ratingsIndex; i++) {
        if (ratings[i]['Rating'] != null) {
            str += `Tier ${ratings[i]['Rating']}, `;
        } else {
            str += `Tier N/A, `;
        }
        if (ratings[i]['Enjoyment'] != null) {
            str += `Enjoyment ${ratings[i]['Enjoyment']} by `;
        } else {
            str += `Enjoyment N/A by `;
        }

        str += `${ratings[i]['Name']}\n`;
    }

    levelEmbed.addFields({ name: `Submitted ratings (Page ${curPage} of ${maxPage})`, value: str });
}

// searchResultsEmbed (Embed, array, integer, integer) => void
// constructs search results if there are multiple for a level
function searchResultsEmbed(levelEmbed, searchResults, curPage, maxPage) {
    levelEmbed.setTitle(`**Your search yields multiple results.**`);
    var str = '';
    var resultsIndex = curPage * 10;
    if (searchResults.length < resultsIndex) {
        resultsIndex = searchResults.length;
    }

    for (var i = (curPage-1) * 10; i < resultsIndex; i++) {
        str += `${searchResults[i]['Name']} by ${searchResults[i]['Creator']} (${searchResults[i]['LevelID']})\n`;
    }
    levelEmbed.setDescription(str);

    if (searchResults.length > 10) {
        levelEmbed.setFooter({ text: `...and ${searchResults.length - 10} more. (Page ${curPage} of ${maxPage})` });
    }

}

// levelCommand (array) => array
// creates a new /level embed.
const levelCommand = async (arr) => {
    // arr: [id, search, creator, queryResults, levelInfo, curPage, maxPage, newInt]
    var levelEmbed = new EmbedBuilder().setColor(0xCCFF00);

    var curPage = arr[5];
    if (arr[7] != null) {
        if (arr[7].customId == 'next') {
            curPage = (curPage+1) % arr[6] || arr[6];
        } else {
            curPage = (curPage-1) % arr[6] || arr[6];
        }
    }

    if (arr[0] != null) {
        if (arr[3] != null) {
            var tierValues = arr[3].filter( submission => submission['Rating'] != null );
            tierValues = tierValues.map( submission => submission['Rating'] );
            const minTier = Math.min(...tierValues);
            const maxTier = Math.max(...tierValues);

            createDemonInfo(levelEmbed, arr[4], minTier, maxTier);
            createRatingInfo(levelEmbed, arr[3], curPage, arr[6]);
        } else {
            createDemonInfo(levelEmbed, arr[4], null, null);
        }
    } else {
        searchResultsEmbed(levelEmbed, arr[4], curPage, arr[6]);
    }

    return [levelEmbed, curPage]
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName('level')
        .setDescription('Information about a level in the ladder')
        .addIntegerOption(option =>
            option.setName('id')
            .setDescription('The ID of the demon')
            .setMinValue(1)
        )
        .addStringOption(option =>
            option.setName('name')
            .setDescription('The name of the demon')
        )
        .addStringOption(option =>
            option.setName('creator')
            .setDescription('The creator of the demon')
        ),

    async execute(interaction) {
        var levelEmbed = new EmbedBuilder().setColor(0xCCFF00);
        var id = interaction.options.getInteger('id');
        const search = interaction.options.getString('name');
        const creator = interaction.options.getString('creator');

        var curPage = 1;
        var maxPage = 1;

        var queryResults = null;
        var levelInfo = null;

        console.log(`received /level with ID ${id}, search parameter ${search}, creator ${creator}`);

        await interaction.deferReply();

        if (id == null && search == null && creator == null) {
            await interaction.editReply(`uhh you didn't send a name, id, or creator so not sure what you were expecting.`);
            return;
        }

        if (id == null && (creator != null || search != null)) {
            var query = await searchQuery(search, creator, 1);
            queryResults = query['levels'];
            if (queryResults == null || queryResults.length < 1) {
                if (search != null) {
                    levelEmbed.setTitle(`**No demon found with the name ${search}!**`);
                    levelEmbed.setFooter({ text: `also maybe no demon found with the creator you said either if you did that not sure` });
                    await interaction.editReply({ embeds: [levelEmbed] });
                    return;
                } else {
                    levelEmbed.setTitle(`**No demons found by creator ${creator}!**`);
                    await interaction.editReply({ embeds: [levelEmbed] });
                    return;
                }
            } else if (queryResults.length == 1) {
                id = queryResults[0]['LevelID'];
            } else if (queryResults[0]['Name'].toLowerCase() == search?.toLowerCase() && queryResults[1]['Name'].toLowerCase() != search?.toLowerCase()) {
                id = queryResults[0]['LevelID'];
            } else {
                maxPage = Math.ceil(query['total'] / 50);

                var queries = [];

                while (curPage != maxPage) {
                    queries.push(searchQuery(search, creator, curPage+1));
                    curPage++;
                }
                var results = await Promise.all(queries);
                for (elem of results) {
                    queryResults = queryResults.concat(elem['levels']);
                }

                curPage = 1;
                maxPage = Math.ceil(queryResults.length / 10)
            }
        }

        if (id != null) {
            levelInfo = await helper.IDQuery(id);

            if (levelInfo == "error") {
                levelEmbed.setTitle(`**There is no demon with the ID ${id}!**`);
                await interaction.editReply({ embeds: [levelEmbed] });
                return;
            } else {
                if (levelInfo['SubmissionCount'] > 0) {
                    // get all ratings into one array
                    var query = await ratingQuery(id, 1);
                    maxPage = Math.ceil(query['total'] / 50);
                    queryResults = query['submissions'];

                    var queries = [];

                    while (curPage != maxPage) {
                        queries.push(ratingQuery(id, curPage+1));
                        curPage++;
                    }
                    var results = await Promise.all(queries);
                    for (elem of results) {
                        queryResults = queryResults.concat(elem['submissions']);
                    }
                    
                    curPage = 1;
                    maxPage = Math.ceil(queryResults.length / 10);
                } else {
                    queryResults = null;
                }
            }
        }

        var results = await levelCommand([id, search, creator, queryResults, levelInfo, curPage, maxPage, null]);
        levelEmbed = results[0];
        curPage = results[1];

        const row = commandHelper.prevNextButtons(maxPage);
        await interaction.editReply({ embeds: [levelEmbed], components: [row] })
            .then(() => { console.log(`a level request was sent.`) } )
            .catch(console.error);
        var collector = await commandHelper.createButtonCollector(interaction);
        collector.on('collect', async (i) => {
            results = await commandHelper.activateButton(interaction, i, row, levelEmbed, levelCommand, id, search, creator, queryResults, levelInfo, curPage, maxPage);
            curPage = results[1];
        });
        collector.on('end', () => {
            commandHelper.expireButton(interaction, row, levelEmbed);
        });
    }
}