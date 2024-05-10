/**
 * @typedef {Object} User
 * @property {string} name - The name of the user.
 * @property {string} phoneNumber - The phoneNumber of the user.
 * @property {string} password - The password of the user.
 * @property {string} accessToken - The accessToken of the user.
 */

import { generateRandomNumber } from "../helpers/generator.js";

/**
 * validate user object
 * @param {User} usrs 
 * @returns {Boolean}
 */
export function isUserValid(usrs) {
    if (
        typeof usrs === 'object' &&
        typeof usrs.phoneNumber === 'string' &&
        typeof usrs.password === 'string' &&
        typeof usrs.accessToken === 'string'
    ) {
        return true;
    }
    return false;
}




export function generateInternationalCallingCode() {
    const callingCodes = [
        "93", "355", "213", "1-684", "376", "244", "1-264", "672", "1-268", "54", "374", "297", "61", "43", "994", "1-242", "973", "880", "1-246", "375", "32", "501", "229", "1-441", "975", "591", "387", "267", "55", "246", "1-284", "673", "359", "226", "257", "855", "237", "1", "238", "1-345", "236", "235", "56", "86", "61", "61", "57", "269", "682", "506", "385", "53", "599", "357", "420", "243", "45", "253", "1-767", "1-809", "1-829", "1-849", "670", "593", "20", "503", "240", "291", "372", "251", "500", "298", "679", "358", "33", "689", "241", "220", "995", "49", "233", "350", "30", "299", "1-473", "1-671", "502", "44-1481", "224", "245", "592", "509", "504", "852", "36", "354", "91", "62", "98", "964", "353", "44-1624", "972", "39", "225", "1-876", "81", "44-1534", "962", "7", "254", "686", "383", "965", "996", "856", "371", "961", "266", "231", "218", "423", "370", "352", "853", "389", "261", "265", "60", "960", "223", "356", "692", "222", "230", "262", "52", "691", "373", "377", "976", "382", "1-664", "212", "258", "95", "264", "674", "977", "31", "599", "687", "64", "505", "227", "234", "683", "850", "1-670", "47", "968", "92", "680", "970", "507", "675", "595", "51", "63", "64", "48", "351", "1-787", "1-939", "974", "242", "262", "40", "7", "250", "590", "290", "1-869", "1-758", "590", "508", "1-784", "685", "378", "239", "966", "221", "381", "248", "232", "65", "1-721", "421", "386", "677", "252", "27", "82", "211", "34", "94", "249", "597", "47", "268", "46", "41", "963", "886", "992", "255", "66", "228", "690", "676", "1-868", "216", "90", "993", "1-649", "688", "1-340", "256", "380", "971", "44", "1", "598", "998", "678", "379", "58", "84", "681", "212", "967", "260", "263"
    ];

    return callingCodes[generateRandomNumber(0, callingCodes.length - 1)];
}

/**
 * @typedef {Object} UserCustomer
 * @property {string} userId - The name of the user.
 * @property {string} name - The name of the user.
 * @property {string} phoneNumber - The phoneNumber of the user.
 */


