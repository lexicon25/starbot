/* deploy-commands.js
 * starbot
 * by Lexicon25
 * 
 * to be run whenever a command's data is updated/new command is created
 */

// requires
const fs = require('node:fs');
require('dotenv').config();
const { REST, Routes } = require('discord.js');

const commands = [];
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
    const command = require(`./commands/${file}`);
    commands.push(command.data.toJSON());
}

const rest = new REST({ version: `10` }).setToken(process.env.CLIENT_TOKEN);

// loadData () => void
// load/refresh command data in the discord server
const loadData = async () => {
    try {
        console.log(`Started refreshing ${commands.length} application (/) commands...`);

        const data = await rest.put(
            Routes.applicationCommands(process.env.CLIENT_ID),
            { body: commands },
        );

        console.log(`Reloaded ${data.length} application (/) commands.`);
    } catch (error) {
        console.error(error);
    }
};

loadData();