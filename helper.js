/* helper.js
 * starbot
 * by Lexicon25
 * 
 * useful helper functions/variables used in other files.
 */

const diffHex = [
    0xDDDFEE, 0xD5D3E9, 0xD3CBE7, 0xD3C3E4, 0xD4BBE2,
    0xD5B0DE, 0xDBA7DC, 0xDB9FD1, 0xD991C1, 0xDA86B0,
    0xDB7698, 0xDC6A7D, 0xDD5A5A, 0xDC514C, 0xDA493E,
    0xDA4535, 0xD93E26, 0xCD3F23, 0xC03A1B, 0xB23415,
    0xA23010, 0x9B2B0C, 0x932B0B, 0x892608, 0x832607,
    0x752105, 0x6C1E04, 0x601A02, 0x5A1802, 0x511700,
    0x491900, 0x3F1A00, 0x331700, 0x231300, 0x110A00
];

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

// arrayRandom (array) => array element
// picks a random element from array arr
function arrayRandom(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
}

module.exports = {
    diffHex: diffHex,
    sleep: sleep,
    isValidURL: isValidURL,
    arrayRandom: arrayRandom,
}