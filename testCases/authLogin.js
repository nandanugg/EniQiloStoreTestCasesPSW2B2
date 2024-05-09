import { fail } from "k6";
import { generateTestObjects } from "../helpers/generator.js";
import { testPostJsonAssert } from "../helpers/request.js";
import { isUserValid } from "../types/user.js";
import { isExists } from "../helpers/assertion.js";

const registerNegativePayloads = (positivePayload) => generateTestObjects({
    phoneNumber: { type: "string", notNull: true, minLength: 10, maxLength: 16 },
    name: { type: "string", notNull: true, minLength: 5, maxLength: 50 },
    password: { type: "string", minLength: 5, maxLength: 15, notNull: true }
}, positivePayload)
/**
 * 
 * @param {import("../config.js").Config} config 
 * @param {Object} tags 
 * @param {import("../types/user.js").User} user
 * @returns {import("../types/user.js").User | null}
 */
export function TestLogin(user, config, tags) {
    const currentRoute = `${config.BASE_URL}/v1/staff/login`
    const currentFeature = "login"

    if (!isUserValid(user)) {
        fail("Invalid user object")
    }

    const headers = {}

    /** @type {import("../types/user.js").User} */
    const registerPositivePayload = {
        name: user.name,
        phoneNumber: user.phoneNumber,
        password: user.password
    }

    /** @type {import("../helpers/request.js").RequestAssertResponse} */
    let res;

    if (!config.POSITIVE_CASE) {
        registerNegativePayloads(registerPositivePayload).forEach((payload) => {
            testPostJsonAssert(currentFeature, "invalid payload", currentRoute, payload, {}, {
                ['should return 400']: (res) => res.status === 400,
            }, config, tags);
        });
    }

    res = testPostJsonAssert(currentFeature, "login with correct payload", currentRoute, registerPositivePayload, headers, {
        ['should return 200']: (res) => res.status === 200,
        ['should return have a userId']: (res) => isExists(res, "data.userId"),
        ['should return have a phoneNumber']: (res) => isExists(res, "data.phoneNumber"),
        ['should return have a name']: (res) => isExists(res, "data.name"),
        ['should return have an accessToken']: (res) => isExists(res, "data.accessToken"),
    }, config, tags);

    if (res.isSuccess) {
        return Object.assign(registerPositivePayload, { accessToken: res.res.json().data.accessToken })
    }
    return null

}