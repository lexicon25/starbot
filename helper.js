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

const diffEmotes = {
    Official: '<:harddemon:744781878309027901>',
    Easy: '<:easydemon:744780772291903608>',
    Medium: '<:mediumdemon:744780777308291206>',
    Hard: '<:harddemon:744781878309027901>',
    Insane: '<:insanedemon:744780774573867069>',
    Extreme: '<:extremedemon:744780784350527550>'
}

const tierEmotes = {
    1: '<:tier01:1010882247928315984>',
    2: '<:tier02:1010882250017095731>',
    3: '<:tier03:1010882252613357679>',
    4: '<:tier04:1010882256988033024>',
    5: '<:tier05:1010882258732847215>',
    6: '<:tier06:1010882260943241237>',
    7: '<:tier07:1010882263522758656>',
    8: '<:tier08:1010882266295177246>',
    9: '<:tier09:1010882268388151307>',
    10: '<:tier10:1010882271928123392>',
    11: '<:tier11:1010882275065462834>',
    12: '<:tier12:1010882278475440138>',
    13: '<:tier13:1010882281973481513>',
    14: '<:tier14:1010882284112588850>',
    15: '<:tier15:1010882287535144960>',
    16: '<:tier16:1010882291083517963>',
    17: '<:tier17:1010882293260369980>',
    18: '<:tier18:1010882295961497671>',
    19: '<:tier19:1010882299254026250>',
    20: '<:tier20:1010882302227787806>',
    21: '<:tier21:1010882305591619616>',
    22: '<:tier22:1010882308225646642>',
    23: '<:tier23:1010882311941799986>',
    24: '<:tier24:1010882314957500506>',
    25: '<:tier25:1010882318132592730>',
    26: '<:tier26:1010882321496416366>',
    27: '<:tier27:1010882324163993671>',
    28: '<:tier28:1010882327750123530>',
    29: '<:tier29:1010882330845519962>',
    30: '<:tier30:1010882333957697617>',
    31: '<:tier31:1010882336293924895>',
    32: '<:tier32:1010882339980714064>',
    33: '<:tier33:1010882343545864192>',
    34: '<:tier34:1010882347358507008>',
    35: '<:tier35:1010882350919454780>',
}

const enjoyEmotes = {
    10: '<:cool:959714349570744371>',
    9: '<:cool:959714349570744371>',
    8: '<:epic:959714349113548871>',
    7: '<:epic:959714349113548871>',
    6: '<:idk:979048360013103135>',
    5: '<:idk:979048360013103135>',
    4: '<:idk:979048360013103135>',
    3: '<:unepic:959714349046456370>',
    2: '<:unepic:959714349046456370>',
    1: '<:flippingbad:959714349268729866>',
    0: '<:flippingbad:959714349268729866>'
}

const easterEggs = [
    { id: 4284013,  text: `not enough NC ratings tbh` },
    { id: 4955272,  text: `(it died somehow)` },
    { id: 17233618, text: `i can already hear oreos running over here` },
    { id: 52113279, text: `Apple, Google: REMOVE GEOMETRY DASH FROM YOUR STORES` },
    { id: 60660086, text: `Tier what the fuck do you mean multition 6` },
    { id: 61079355, text: `acu 🆓` },
    { id: 69108628, text: `rest in peace ladderbot.exe` },
    { id: 69434308, text: `WHY DO SO MANY PEOPLE ENJOY CODING` },
    { id: 73289291, text: `impossible demon` },
    { id: 74744836, text: `hi WhiteEmerald!` },
    { id: 76074130, text: `i too love consuming vast amounts of chlorine!` },
    { id: 76196489, text: `The gameplay feels like a medium demon after you learn it, the learning process is what makes this level seem like an extreme demon` },
    { id: 77134293, text: `funny levle` },
    { id: 80671416, text: `Only legends remember this level being named Qweerios` },
    { id: 80790301, text: `preferably don't rate based on the bad ending since it really isn't that intuitive to find yknow` },
    { id: 81493932, text: `REDRACEfr` },
    { id: 82273446, text: `Rip off of inanimate INSANITY and you can't tell me otherwise...` },
    { id: 86107536, text: `Reminder to NOT RATE BASED ON THE SECRET WAY` }, 
    { id: 86917672, text: `Reminder to NOT RATE BASED ON THE SECRET WAY` },
    { id: 87240147, text: `Reminder to NOT RATE BASED ON THE SECRET WAY` },
    { id: 86230468, text: `when the code is faulty` },
]

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
    diffEmotes: diffEmotes,
    tierEmotes: tierEmotes,
    enjoyEmotes: enjoyEmotes,
    easterEggs: easterEggs,
    sleep: sleep,
    isValidURL: isValidURL,
    arrayRandom: arrayRandom,
}