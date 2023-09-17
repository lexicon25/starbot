/* events/ready.js
 * starbot
 * by Lexicon25
 * 
 * logs in
 */

// requires
const { Events } = require('discord.js');

module.exports = {
    name: Events.ClientReady,
    once: true,
    execute(client) {
        console.log(`Logged in as ${client.user.tag}`);
    },
};