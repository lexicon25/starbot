/* helper.js
 * starbot
 * by Lexicon25
 * 
 * useful helper functions/variables used in other files.
 */

// sleep (integer) => void
// simple sleep function to allow the site/anything time to work
function sleep(ms) {
    return new Promise( (resolve) => {
        setTimeout(resolve, ms);
    });
}

// isValidURL (string) => boolean
// returns if the string is a valid URL or not
function isValidURL(link) {
    try {
        new URL(link);
        return true;
    } catch (error) {
        return false;
    }
}

module.exports = {
    isValidURL: isValidURL,
    sleep: sleep,
}