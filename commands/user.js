/* commands/user.js
 * starbot
 * by Lexicon25
 * 
 * modelled after g!user from LadderBot (RFMX)
 * Displays ratings submitted by a user.
 */

// requires
const axios = require('axios');
const helper = require('./../helper.js');
const commandHelper = require('./../cmdhelper.js');
const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

// usearchQuery (string) => array
// searches for user ids based on a user search parameter
const usearchQuery = async(username) => {
    var url = `https://gdladder.com/api/user/search?chunk=10&name=${username}`;
    try {
        const query = await axios.get(url);

        return query['data'];
    } catch (error) {
        console.error(error);
    }
}

// levelQuery (string) => array
// searches for levels based on a level search parameter
const levelQuery = async (search) => {
    var url = `https://gdladder.com/api/level/search?chunk=10&name=${search}`;
    try {
        const query = await axios.get(url);

        return query['data'];
    } catch (error) {
        console.error(error);
    }
}

// userQuery (integer) => array
// searches for user info based on user_id parameter
const userQuery = async (user_id) => {
    var url = `https://gdladder.com/api/user?userID=${user_id}`;
    try {
        const query = await axios.get(url);

        return query['data'];
    } catch (error) {
        console.error(error);
    }
}

// ratingQuery (integer, integer, integer, string, string) => array
// searches for ratings based on user_id and other parameters
const ratingQuery = async (user_id, page, tier, search, creator) => {
    var url = `https://gdladder.com/api/user/submissions/search?userID=${user_id}&page=${page}&chunk=10`;
    if (tier != null) {
        url += `&lowTier=${tier}&highTier=${tier}`;
    }
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

// userCommand (array) => array
// creates a new /user embed.
const userCommand = async (arr) => {
    // arr: [queryResults, userInfo, mode, tier, search, curPage, maxPage, newInt]
    var userEmbed = new EmbedBuilder().setColor(0xCCFF00);
    var curPage = arr[5];

    if (arr[7] != null) {
        if (arr[7].customId == 'next') {
            curPage = (curPage+1) % arr[6] || arr[6];
        } else {
            curPage = (curPage-1) % arr[6] || arr[6];
        }
    }
    
    if (arr[2] == 0) {
        var title = `Submissions for ${arr[1]['username']}`;
        if (arr[3] != null) {
            title += ` (Tier ${arr[3]})`;
        }
        userEmbed.setTitle(title);

        var query = await ratingQuery(arr[1]['user-id'], curPage, arr[3], arr[4], null);

        var str = '';
        for (elem of query['levels']) {
            if (elem['Rating'] == null) {
                elem['Rating'] = 'N/A';
            }
            if (elem['Enjoyment'] == null) {
                elem['Enjoyment'] = 'N/A';
            }

            str += `${elem['Name']} (${elem['LevelID']}) as Tier ${elem['Rating']}, Enjoyment ${elem['Enjoyment']}\n`;
        }
        userEmbed.setDescription(str);

        if (arr[1]['avg-enj'] != null) {
            userEmbed.addFields({ name: `Extra Info:`, value: `Average Enjoyment: ${(Math.round(arr[1]['avg-enj'] * 100) / 100).toString()}` });
        }
        userEmbed.setFooter({ text: `Page ${curPage} of ${arr[6]} out of ${arr[0]['total']} submissions` });
    } else if (arr[2] == 1) {
        userEmbed.setTitle(`Multiple users found, showing ${arr[0].length} closest matches.`);
        userEmbed.setFooter({ text: `Try being more specific when typing the username or specify their user ID in your command!` });

        var str = '';
        for (elem of arr[0]) {
            str += `${elem['Name']} (${elem['ID']})\n`;
        }
        userEmbed.setDescription(str);
    } else if (arr[2] == 2) {
        userEmbed.setTitle(`Submission for ${arr[1]['username']} on ${arr[0]['Name']} (${arr[0]['LevelID']})`);
        var rquery = await ratingQuery(arr[1]['user-id'], 1, null, arr[0]['Name'], arr[0]['Creator']);
        rquery = rquery['levels'][0];
        userEmbed.addFields(
            { name: `Your Rating Details`, value: `Tier ${rquery['Rating']}\nEnjoyment ${rquery['Enjoyment']}\nDone on ${rquery['RefreshRate']}hz ${rquery['Device']}`, inline: true },
            { name: `Ladder Rating Details`, value: `Tier ${(Math.round(arr[0]['Rating'] * 100) / 100).toString()}\nEnjoyment ${(Math.round(arr[0]['Enjoyment'] * 100) / 100).toString()}`, inline: true }
        );
    }

    return [userEmbed, curPage];
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName('user')
        .setDescription('Ratings submitted by a user')
        .addIntegerOption(option =>
            option.setName('user-id')
            .setDescription(`The ID of the user to search. Prioritized over username.`)
        )
        .addStringOption(option =>
            option.setName('username')
            .setDescription('The username of the player you want to see ratings for')
        )
        .addIntegerOption(option =>
            option.setName('tier')
            .setDescription('The tier of player ratings to search for')
            .setMinValue(1)
            .setMaxValue(35)
        )
        .addIntegerOption(option =>
            option.setName('page')
            .setDescription(`The page of ratings to jump to. Defaults to page 1.`)
            .setMinValue(1)
        )
        .addStringOption(option =>
            option.setName('search')
            .setDescription('A search parameter to view player ratings of')
        )
        .addIntegerOption(option =>
            option.setName('level-id')
            .setDescription(`The ID of the demon to view the player's rating of. Prioritized over search.`)
        ),
    
    async execute(interaction) {
        var user_id = interaction.options.getInteger('user-id');
        const username = interaction.options.getString('username');
        var page = interaction.options.getInteger('page') ?? 1;
        const tier = interaction.options.getInteger('tier');
        const search = interaction.options.getString('search');
        var level_id = interaction.options.getInteger('level-id');

        var queryResults = null;
        var mode = -1;

        if (user_id == null && username == null) {
            await interaction.reply(`uhh you didn't send a user_id or a username to look for so not sure what you were expecting.`);
            return;
        }

        await interaction.deferReply();

        var curPage = 1;

        var userInfo = {};

        if (user_id == null) {
            var query = await usearchQuery(username);

            if (query == null || query.length < 1) {
                await interaction.editReply(`No user found matching the name ${username}!`);
                return;
            } else if (query.length == 1) {
                user_id = query[0]['ID'];
            } else {
                queryResults = query;
                mode = 1;
            }
        }

        if (user_id != null) {
            var uquery = await userQuery(user_id);
            userInfo['username'] = uquery['Name'];
            userInfo['user-id'] = user_id;
            if (tier == null || search == null) {
                userInfo['avg-enj'] = uquery['AverageEnjoyment'];
            }

            if (level_id == null && search != null) {
                var lquery = await levelQuery(search);
                lquery = lquery['levels'];

                if (lquery == null || lquery.length < 1) {
                    await interaction.editReply(`No level matching the name ${search}!`);
                    return;
                } else if (lquery.length == 1) {
                    level_id = lquery[0]['LevelID'];
                } else if (lquery[0]['Name'].toLowerCase() == search.toLowerCase() && lquery[1]['Name'].toLowerCase() != search.toLowerCase()) {
                    level_id = lquery[0]['LevelID'];
                }
            }

            if (level_id != null) {
                var query = await helper.IDQuery(level_id);
                queryResults = query;
                mode = 2;
            } else {
                var query = await ratingQuery(user_id, page, tier, search, null);

                var maxPage = Math.ceil(query['total'] / 10);

                queryResults = query;
                mode = 0;
            }
        }

        var results = await userCommand([queryResults, userInfo, mode, tier, search, curPage, maxPage, null]);
        var userEmbed = results[0];
        curPage = results[1];

        const row = commandHelper.prevNextButtons(maxPage);

        if (mode == 1 || mode == 2) {
            row.components[0].setDisabled(true);
            row.components[1].setDisabled(true);
        }

        await interaction.editReply({ embeds: [userEmbed], components: [row] })
            .then(() => { console.log(`a user command was sent.`) })
            .catch(console.error);
        var collector = await commandHelper.createButtonCollector(interaction);
        collector.on('collect', async (i) => {
            results = await commandHelper.activateButton(interaction, i, row, userEmbed, userCommand, queryResults, userInfo, mode, tier, search, curPage, maxPage, i);
            curPage = results[1];
        });
        collector.on('end', () => {
            commandHelper.expireButton(interaction, row, userEmbed);
        });
    }
}