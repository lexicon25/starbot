/* index.js
 * starbot
 * by Lexicon25
 * 
 * main js file: handles each command/logs in
 */

// requires
const fs = require('node:fs');
const path = require('node:path');
require('dotenv').config();
const { Client, GatewayIntentBits, Collection } = require('discord.js');

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,           // most server message stuff
        GatewayIntentBits.GuildMessages,    // see messages if needed
    ]
});

client.commands = new Collection();

// runFiles (string, function) => void
// sets up files according to the setupFile function and the directory where files are
function runFiles(dirpath, setupFile) {
    const files = fs.readdirSync(dirpath).filter(file => file.endsWith('.js'));

    for (const file of files) {
        const filepath = path.join(dirpath, file);
        const type = require(filepath);

        setupFile(type, filepath);
    }
}

// setupCommand (SlashCommandBuilder, string) => void
// sets up commands; to be called by runFiles
function setupCommand(command, filepath) {
    if ('data' in command && 'execute' in command) {
        client.commands.set(command.data.name, command);
    } else {
        console.log(`WARNING: ${filepath} is missing a required "data" or "execute" property.`);
    }
}

// setupEvent (event module) => void
// sets up events; to be called by runFiles
function setupEvent(event) {
    if (event.once) {
        client.once(event.name, (...args) => event.execute(...args));
    } else {
        client.on(event.name, (...args) => event.execute(...args));
    }
}

const commandsPath = path.join(__dirname, 'commands');
const eventsPath = path.join(__dirname, 'events');

runFiles(commandsPath, setupCommand);
runFiles(eventsPath, setupEvent);

// log in with "/help" message
client.login(process.env.CLIENT_TOKEN)
.then(() => {
    client.user.setPresence({
        activities: [{ name: '/help' }],
        status: 'online'
    });
});