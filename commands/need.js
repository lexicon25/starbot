/* commands/need.js
 * starbot
 * by Lexicon25
 * 
 * modelled after g!need from LadderBot (RFMX)
 * generates demons based on a desired tier
 */

// requires
const axios = require('axios');
const helper = require('./../helper.js');
const commandHelper = require('./../cmdhelper.js');
const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

// possible titles
const easyTitles = [
    `**Grinding demons, eh?**`,
    `**Here's your next goal.**`,
    `**You'll be an expert someday.**`,
    `**99% of people can beat these. :joy: :ok_hand:**`,
    `**Let me guess, you are beating an Extreme? No? Okay.**`,
    `**even harder than Back on Track tbh**`,
    `**Finally pulling yourself to beat another demon, aren't you?**`,
    `**So you're jumping from Bloodbath?**`,
    `**so pro**`,
    `**Your 62739th demon is:**`,
    `**Let's hope a few of these are fun.**`,
];

const hardTitles = [
    `**Fancy a challenge, eh?**`,
    `**I guess one of these would be your next hardest.**`,
    `**Um, go?**`,
    `**Honestly, everyone will be amazed if you beat these.**`,
    `**Are you doing this for a demon roulette?**`,
    `**99% of people cannot beat these. :joy: :ok_hand:**`,
    `**Yet another Medium Demon? Crap, wrong guess.**`,
    `**so free tbh**`,
    `**Finally trying to have a new hardest, aren't you?**`,
    `**So you're grinding after beating Deadlocked?**`,
    `**skill issue**`,
    `**Your 8.2039e294th demon is:**`,
    `**Why try so hard? An easier tier will still get you 10 stars.**`,
];

const unratedTitles = [
    `**A Tier... unrated? I guess that's a tier.**`,
    `**I see you're into stuff that is unknown.**`,
    `**Yes. It helps the project grow. Do remember to drop a rating.**`,
    `**Warning: enjoyability not guaranteed.**`,
    `**I hope you run into Ouroboros.**`,
    `**There's 90% of levels bearing a tier and you are picking these.**`,
    `**I can't stop you from being the curious cat.**`,
    `**Curiosity allows people to discover hidden gems.**`,
    `**Maybe you can make a race out of these.**`,
    `**Statistics show that when there is one more rated level, there is one less unrated level.**`,
    `**I'm guessing you are beating a Harder level. This is the Demon Ladder? Whatever.**`,
    `**99% of the people think ads are boring. :joy: :ok_hand:**`,
    `**Finally getting yourself to... what? Unrated?**`,
    `**so random**`,
    `**support the GD Demon Ladder thanks**`,
    `**\*inserts random quote about being random\***`,
    `**So you're beating your first demon?**`,
    `**random issues**`,
    `**Your -387th demon is:**`,
    `**You are brave. I like it.**`,
    `**Wasn't expecting that one.**`,
];

const funTitles = [
    `**Want something fun for once, huh?**`,
    `**Warning: enjoyability still not guaranteed.**`,
    `**The GDDL community (one person) has determined this level to be fun.**`,
    `**Trust in your fellow GDDL members: They probably won't not rate correctly.**`,
    `**Your ith demon is:**`,
    `**so fun**`,
    `**So you're trying to find something fun after a terrible grind?**`,
    `**Finally playing something you don't want to die playing, aren't you?**`,
    `**Don't know why you are even trying, fun levels don't exist in GD.**`,
];

const unfunTitles = [
    `**Some kind of masochist, huh?**`,
    `**It can't be that bad, right...?**`,
    `**I hope you get the blood room.**`,
    `**Your Ωth demon is:**`,
    `**so bad**`,
    `**The GDDL is known for being 100% correct about all enjoyment opinions all of the time.**`,
    `**I bet one person is just dragging down the average, it can't be this bad right?**`,
    `**Trying to be different, I see.**`,
    `**mindset issue**`,
    `**Finally getting yourself to... why are you doing this to yourself??**`,
    `**My opinion is that if you don't enjoy these it's just a skill issue**`,
];

// needQuery (integer, integer, integer, string, integer) => array
// requests gdladder.com for random demons based on command parameters.
const needQuery = async(tier, amount, enjoy, relation, igd) => {
    var url = `https://gdladder.com/api/level/search?sort=Random&chunk=${amount}`;
    if (tier != null && tier != 0) {
        url += `&lowTier=${(tier-0.5)}&highTier=${(tier+0.499)}`;
    }
    if (tier == 0) {
        url += `&removeUnrated=false&removeRated=true`;
    }
    if (enjoy != null) {
        if (relation != '>') {
            url += `&enjHigh=${enjoy}`;
        }
        if (relation != '<') {
            url += `&enjLow=${enjoy}`;
        }
    }
    if (igd != null) {
        url += `&difficulty=${igd}`;
    }

    try {
        const query = await axios.get(url);

        return query['data'];
    } catch (error) {
        console.error(error);
    }
}

// needCommand (array) => array
// creates a new /need embed.
const needCommand = async(arr) => {
    // arr: [title, tier, amount, enjoy, relation, igd]
    var needEmbed = new EmbedBuilder().setColor(0xCCFF00);
    needEmbed.setTitle(arr[0]);

    if (arr[1] == 0) {
        needEmbed.setColor(0xBBBBBB);
    } else if (arr[1] != null) {
        needEmbed.setColor(helper.diffHex[arr[1]-1]);
    }

    var demons = await needQuery(arr[1], arr[2], arr[3], arr[4], arr[5]);

    var NOT_ENOUGH = arr[2] > demons['levels'].length;
    var NO_DEMONS = demons['levels'].length < 1;

    if (NO_DEMONS) {
        needEmbed.setTitle('No demons exist with the parameters you set.');
    } else if (NOT_ENOUGH) {
        if (enjoy == null) {
            needEmbed.setFooter({ text: `${arr[2]} Tier ${arr[1]}'s do not exist, so we only list ${demons['levels'].length} of them.`});
        } else {
            needEmbed.setFooter({ text: `${arr[2]} levels do not exist with the specified enjoyment, so we only list ${demons['levels'].length} of them.` });
        }
        amount = demons['levels'].length;
    }

    if (!NO_DEMONS) {
        for (var i = 0; i < arr[2]; i++) {
            if (Math.random() < 0.1) {
                demons['levels'][i]['LevelID'] = 68668045;
            }
            needEmbed.addFields({
                name: demons['levels'][i]['Name'],
                value: demons['levels'][i]['LevelID'].toString(),
                inline: true
            });
        }
    }

    return [needEmbed, NOT_ENOUGH, NO_DEMONS];
}

// specialTitles (array of strings, integer, integer) => array of strings
// adds special titles to the possible titles list
function specialTitles(possibleTitles, tier, enjoy) {
    if (tier != null) {
        possibleTitles = possibleTitles.concat([`**A tier ${tier}, you say?**`]);

        if (tier <= 10) {
            possibleTitles = possibleTitles.concat([
                `**Tier ${tier}? Gotcha.**`,
                `**Certified as Tier ${tier}, players approved**`,
            ]);
        }
        if (tier > 10) {
            possibleTitles = possibleTitles.concat([
                `**On my way to deliver a Tier ${tier} to you.**`,
                `**Certified as Tier ${tier}, players approved**`,
            ]);
        }
        if (tier == 15) {
            possibleTitles = possibleTitles.concat(["**Insanely hard demons.**"]);
        }
        if (tier == 20) {
            possibleTitles = possibleTitles.concat(["**Extremely insane demons.**"]);
        }
        if (tier == 21 || tier == 26) {
            possibleTitles = possibleTitles.concat(["**I would like to change my rating from a 21 to a 26**"]);
        }
        if (tier >= 30) {
            possibleTitles = possibleTitles.concat([
                "**These are probably harder than DeCode!**",
                "**That guy named Unrated has probably beaten some of these.**",
            ]);
        }
        if (tier >= 33) {
            possibleTitles = possibleTitles.concat(["**free**"]);
        }
    }

    if (enjoy != null) {
        possibleTitles = possibleTitles.concat([`**Enjoyment ${enjoy}, you say?**`]);

        if (enjoy >= 0 && enjoy <= 4) {
            possibleTitles = possibleTitles.concat(["**Better not set your expectations too high for these ones.**"]);
        }
        if (enjoy <= 1) {
            possibleTitles = possibleTitles.concat(["**Some people find fun in not having fun, and that's okay.**"]);
        }
        if (enjoy == 10) {
            possibleTitles = possibleTitles.concat(["**The best of the best, according to at least one person.**"]);
        }
    }

    if (Math.random() < 0.01) {
        possibleTitles = possibleTitles.concat(["**also add a random 0.1% chance message because why not**"]);
    }

    return possibleTitles;
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName('need')
        .setDescription('Random levels of your desired tier')
        .addIntegerOption(option => 
            option.setName('tier')
            .setDescription('The tier of random demons (Tier 1-35, or 0 for unrated)')
            .setMinValue(0)
            .setMaxValue(35)
        )
        .addIntegerOption(option =>
            option.setName('amount')
            .setDescription('The amount of demons to generate (up to 15)')
            .setMinValue(1)
            .setMaxValue(15)
        )
        .addIntegerOption(option =>
            option.setName('enjoy')
            .setDescription('The enjoyment of the demon (modified by relation)')
            .setMinValue(0)
            .setMaxValue(10)
        )
        .addStringOption(option =>
            option.setName('relation')
            .setDescription('How the enjoyment search should be applied (needs enjoy). Defaults to equals.')
            .addChoices(
                { name: 'equals', value: '=' },
                { name: 'more than', value: '>' },
                { name: 'less than', value: '<' },
            )
        )
        .addIntegerOption(option =>
            option.setName('in-game')
            .setDescription('The in-game difficulty the demons should be.')
            .addChoices(
                { name: 'Easy Demon', value: 2 },
                { name: 'Medium Demon', value: 3 },
                { name: 'Hard Demon', value: 4 },
                { name: 'Insane Demon', value: 5 },
                { name: 'Extreme Demon', value: 6 },
            )
        ),

    async execute(interaction) {
        var needEmbed = new EmbedBuilder().setColor(0xCCFF00);
        var tier = interaction.options.getInteger('tier');
        var amount = interaction.options.getInteger('amount') ?? 5;
        var enjoy = interaction.options.getInteger('enjoy');
        var relation = interaction.options.getInteger('relation') ?? '=';
        var igd = interaction.options.getInteger('in-game');

        if (tier == null && enjoy == null && igd == null) {
            await interaction.reply(`uhh you didn't send a tier, enjoyment, or in-game difficulty so not sure what you were expecting.`);
            return;
        }

        await interaction.deferReply();

        // pick random title based on parameters
        var title;
        var possibleTitles = [];
        if (tier == 0) {
            possibleTitles = possibleTitles.concat(unratedTitles);
        } else {
            if (tier != null) {

                if (tier <= 10) {
                    possibleTitles = possibleTitles.concat(easyTitles);
                } else {
                    possibleTitles = possibleTitles.concat(hardTitles);
                }
            } else {
                if (igd != null) {
                    if (igd <= 3) {
                        possibleTitles = possibleTitles.concat(easyTitles);
                    } else {
                        possibleTitles = possibleTitles.concat(hardTitles);
                    }
                }
            }
        }
        if (enjoy != null) {
            if (enjoy > 5) {
                possibleTitles = possibleTitles.concat(funTitles);
            } else {
                possibleTitles = possibleTitles.concat(unfunTitles);
            }
        }
        possibleTitles = specialTitles(possibleTitles, tier, enjoy);
        title = helper.arrayRandom(possibleTitles);

        var results = await needCommand([title, tier, amount, enjoy, relation, igd]);
        needEmbed = results[0];

        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId('reroll')
                .setLabel('Re-roll')
                .setStyle(ButtonStyle.Primary),
        );
        // disable button if not enough demons or no demons
        if (results[1] || results[2]) {
            row.components[0].setDisabled(true);
        }

        await interaction.editReply({ embeds: [needEmbed], components: [row] })
            .then(() => {
                console.log(`${amount} demons of tier ${tier} sent.`);
            })
            .catch(console.error);

        var collector = await commandHelper.createButtonCollector(interaction);
        collector.on('collect', async (i) => {
            await commandHelper.activateButton(interaction, i, row, needEmbed, needCommand, title, tier, amount, enjoy, relation, igd);
        })
        collector.on('end', () => {
            commandHelper.expireButton(interaction, row, needEmbed);
        })
    }
}