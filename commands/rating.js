/* commands/rating.js
 * starbot
 * by Lexicon25
 * 
 * modelled after g!rating from LadderBot (RFMX)
 * sends a rating to gdladder.com and to an internal response channel in the GDDL in case of an error
 */

const axios = require('axios');
const helper = require('./../helper.js')
require('dotenv').config();
const { SlashCommandBuilder } = require('discord.js');

// getError (bool, bool) => string
// gives appropriate error message in the event of a rejected command
function getError(no_rating, ambiguous) {
    if (no_rating && ambiguous) {
        return `Error: We require a difficulty or enjoyment rating, and a level ID or creator for each rating. Please try again!`;
    }
    if (no_rating) {
        return `Error: No difficulty or enjoyment rating submitted! Make sure to do at least one.`;
    }
    if (ambiguous) {
        return `Error: No ID or creator specified. We require at least one just to make finding the level easier and unambiguous.`;
    }
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName('rating')
        .setDescription('Submit difficulty/enjoyment ratings to the ladder!')
        .addStringOption(option => 
            option.setName('demon')
            .setDescription('The name of the demon you played. Does not need to be exact.')
            .setRequired(true)
        )
        .addStringOption(option => 
            option.setName('username')
            .setDescription('Your username! This will show up as your name on the ladder.')
            .setRequired(true)
        )
        .addIntegerOption(option =>
            option.setName('hz')
            .setDescription('The refresh rate/FPS value you played the demon on. Defaults to 60FPS.')
            .setMinValue(1)
            .setMaxValue(360)
        )
        .addIntegerOption(option =>
            option.setName('id')
            .setDescription('The ID of the demon you played.')
            .setMinValue(1)
        )
        .addStringOption(option =>
            option.setName('creator')
            .setDescription('The creator of the demon you played. Helpful if the name is ambiguous.')
        )
        .addIntegerOption(option =>
            option.setName('difficulty')
            .setDescription('The tier rating of the demon. Ranges from Tier 1 to Tier 35.')
            .setMinValue(1)
            .setMaxValue(35)
        )
        .addIntegerOption(option =>
            option.setName('enjoyment')
            .setDescription('Your enjoyment rating of the demon. Ranges from 0 to 10 (0 bad, 10 good)')
            .setMinValue(0)
            .setMaxValue(10)
        )
        .addStringOption(option => 
            option.setName('proof')
            .setDescription('Video proof of completion of the demon (only required for extreme demons')
        ),

    async execute(interaction) {
        const none = `(not provided)`

        var username = interaction.options.getString('username') ?? `(not provided) - Use ${interaction.member.user.username}`;
        var hz = interaction.options.getInteger('hz') ?? 60;
        var demon = interaction.options.getString('demon');
        var id = interaction.options.getInteger('id') ?? none;
        var creator = interaction.options.getString('creator') ?? none;
        var difficulty = interaction.options.getInteger('difficulty') ?? none;
        var enjoyment = interaction.options.getInteger('enjoyment') ?? none;
        var proof = interaction.options.getString('proof') ?? none;

        const NO_RATING = (difficulty == none) && (enjoyment == none);
        const AMBIGUOUS = (id == none) && (creator == none);
        var REJECT = false;

        if (NO_RATING || AMBIGUOUS) {
            REJECT = true;

            await interaction.reply({
                content: getError(NO_RATING, AMBIGUOUS),
                ephemeral: true
            })
        }

        if (!REJECT) {
            const channel = await interaction.client.channels.fetch(process.env.RATING_CHANNEL);

            var str = `New response submitted at ${interaction.createdAt.toUTCString()} by ${interaction.member.user.tag}\n`
                + `User: ${username}\n`
                + `Refresh Rate: ${hz}\n`
                + `Level Name: ${demon}\n`
                + `ID: ${id}\n`
                + `Creator: ${creator}\n`
                + `Rated Tier: ${difficulty}\n`
                + `Rated Enjoyment: ${enjoyment}\n`
                + `Proof: ${proof}\n`
                + `ERROR TYPE: `;

            // send rating to the site
            var body = {
                username: username,
                level: demon,
                refreshRate: hz,
                apiKey: process.env.API_KEY
            }

            if (id != none) { body.levelID = id; }
            if (creator != none) { body.creator = creator; }
            if (difficulty != none) { body.rating = difficulty; }
            if (enjoyment != none) { body.enjoyment = enjoyment; }
            if (proof != none && helper.isValidURL(proof)) { body.proof = proof; }

            
            axios.post('https://gdladder.com/api/submit/starbot', body)
            .then( (res) => {
                console.log(res['data']);
            })
            .catch( (error) => {
                channel.send(str + err['response']['statusText']);
            });
            

            // send rating to discord

            await interaction.reply({
                content: 'Rating successfully submitted!',
                ephemeral: true
            })

            console.log(str);

            await helper.sleep(2500);
            await interaction.deleteReply()
            .then(console.log('Rating reply deleted.'))
            .catch(console.error);
        }
    }
};