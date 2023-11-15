/* commands/rank.js
 * starbot
 * by Lexicon25
 * adapted from discord.js documentation
 * 
 * Function: shows the "rank" of a player for each Tier
 */

// requires
const axios = require('axios');
const commandHelper = require('./../cmdhelper.js');
const { SlashCommandBuilder, EmbedBuilder } = require('discord.js')

const grades = [
    { grade: 'S',    minPerc: 1 },
    { grade: 'X',    minPerc: 0.9 },
    { grade: 'IX',   minPerc: 0.8 },
    { grade: 'VIII', minPerc: 0.7 },
    { grade: 'VII',  minPerc: 0.6 },
    { grade: 'VI',   minPerc: 0.5 },
    { grade: 'V',    minPerc: 0.4 },
    { grade: 'IV',   minPerc: 0.3 },
    { grade: 'III',  minPerc: 0.2 },
    { grade: 'II',   minPerc: 0.1 },
    { grade: 'I',    minPerc: 0.01 },
    { grade: '0',    minPerc: 0 },
];

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

// gradeQuery (string, int) => array
// gets number of rated/unrated levels that the user has beaten / just generically depending on parameters
const gradeQuery = async(user_id, tier) => {
    var url = `https://gdladder.com/api/level/search?chunk=1`;
    if (user_id != null) {
        url += `&notRatedBy=${user_id}`;
    }
    if (tier > 0) {
        url += `&lowTier=${tier}&highTier=${tier}`;
    } else if (tier == 0) {
        url += `&removeRated=true`;
    }
    try {
        const query = await axios.get(url);

        return query['data']['total'];
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

const gradeCommand = async(arr) => {
    // arr: [queryResults, username, mode, curPage, maxPage, newInt]
    var gradeEmbed = new EmbedBuilder().setColor(0xCCFF00);

    var curPage = arr[3];
    if (arr[5] != null) {
        if (arr[5].customId == 'next') {
            curPage = (curPage+1) % 4 || 4;
        } else {
            curPage = (curPage-1) % 4 || 4;
        }
    }

    if (arr[2] == 1) {
        gradeEmbed.setTitle(`Multiple users found, showing ${arr[0].length} closest matches.`)
        gradeEmbed.setFooter({ text: `Try being more specific when typing the username or specify their user ID in your command!` });

        var str = '';
        for (elem of arr[0]) {
            str += `${elem['Name']} (${elem['ID']})\n`;
        }
        gradeEmbed.setDescription(str);
    } else {
        gradeEmbed.setTitle(`${arr[1]}'s Rating Completion on the GDDL:`);

        // overall
        var completed = arr[0][0].reduce((a, b) => a+b, 0);
        var exists = arr[0][1].reduce((a,b) => a+b, 0);

        var percent = (exists - completed) / exists;
        var grade = `? (error occurred)`;
        grades.some( (g) => { if (percent >= g['minPerc']) {grade = g['grade']; return true; } });
        var str = `**Overall**: Rank ${grade} (${percent.toLocaleString(undefined, { style: 'percent', minimumFractionDigits:2})}, ${exists - completed} / ${exists})\n`;

        var j = curPage*10 + 1;
        if (j > 36) { j = 36; }

        for (var i=(curPage-1) * 10 + 1; i < j; i++) {
            exists = arr[0][1][i]
            completed = exists - arr[0][0][i];
            percent = completed / exists;
            grades.some( (g) => { if (percent >= g['minPerc']) { grade = g['grade']; return true; } });
            str += `**Tier ${i.toString()}**: Rank ${grade} (${percent.toLocaleString(undefined,{style:'percent',minimumFractionDigits:2})}), ${completed} / ${exists}\n`;
        }

        gradeEmbed.setDescription(str);
    }

    return [gradeEmbed, curPage];
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName('rank')
        .setDescription('See overall completion of a player on the ladder')
        .addIntegerOption(option => 
            option.setName('user-id')
            .setDescription(`The ID of the user to search. Prioritized over username.`)
        )
        .addStringOption(option =>
            option.setName('user')
            .setDescription('The name of the user')
        ),

    async execute(interaction) {
        var user_id = interaction.options.getInteger('user-id');
        var username = interaction.options.getString('user');

        if (user_id == null && username == null) {
            await interaction.reply(`uhh you didn't send a user_id or a username to look for so not sure what you were expecting.`);
            return;
        }

        await interaction.deferReply();

        var curPage = 1;
        var maxPage = 4;
        var queryResults = null;
        var mode = 0;
        var userTotals = [];
        var actualTotals = [];

        if (user_id == null) {
            var query = await usearchQuery(username);

            if (query == null || query.length < 1) {
                await interaction.editReply(`No user found matching the name ${username}`);
                return;
            } else if (query.length == 1) {
                user_id = query[0]['ID'];
            } else {
                queryResults = query;
                mode = 1;
                maxPage = 1;
            }
        }

        if (user_id != null) {
            var uquery = await userQuery(user_id);
            username = uquery['Name'];
            var userQueries = [];
            var actualQueries = [];
            for (tier = 0; tier < 36; tier++) {
                userQueries.push(gradeQuery(user_id, tier));
                actualQueries.push(gradeQuery(null, tier));
            }
            var userResults = await Promise.all(userQueries);
            var actualResults = await Promise.all(actualQueries);
            for (elem of userResults) { userTotals = userTotals.concat(elem) }
            for (elem of actualResults) { actualTotals = actualTotals.concat(elem) }
            queryResults = [userTotals, actualTotals]
        }

        var results = await gradeCommand([queryResults, username, mode, curPage, maxPage, null]);
        gradeEmbed = results[0];
        curPage = results[1];

        const row = commandHelper.prevNextButtons(maxPage);
        await interaction.editReply({ embeds: [gradeEmbed], components: [row] })
            .then(() => { console.log(`a grade request was sent.`) })
            .catch(console.error);
        var collector = await commandHelper.createButtonCollector(interaction);
        collector.on('collect', async (i) => {
            results = await commandHelper.activateButton(interaction, i, row, gradeEmbed, gradeCommand, queryResults, username, mode, curPage, maxPage);
            curPage = results[1];
        });
        collector.on('end', () => {
            commandHelper.expireButton(interaction, row, gradeEmbed);
        });
    }
}