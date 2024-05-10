import { fail } from "k6";
import { isEqualWith, isExists } from "../helpers/assertion.js";
import { generateRandomName, generateRandomNumber, generateTestObjects } from "../helpers/generator.js";
import { testGetAssert, testPostJsonAssert } from "../helpers/request.js";
import { generateInternationalCallingCode, isUserValid } from "../types/user.js";

const registerNegativePayloads = (positivePayload) => generateTestObjects({
    phoneNumber: { type: "string", notNull: true, minLength: 10, maxLength: 16 },
    name: { type: "string", notNull: true, minLength: 5, maxLength: 50 },
}, positivePayload)

/**
 * 
 * @returns {import("../types/user.js").UserCustomer}
 */
function generateNewCustomer() {
    return {
        name: generateRandomName(),
        phoneNumber: `+${generateInternationalCallingCode()}${generateRandomNumber(1000000, 999999999)}`,
    }
}

/**
 * 
 * @param {import("../config.js").Config} config 
 * @param {Object} tags 
 * @param {import("../types/user.js").User} user
 * @returns {import("../types/user.js").UserCustomer | null}
 */
export function TestCustomerRegister(user, config, tags) {
    const currentRoute = `${config.BASE_URL}/v1/customer/register`
    const currentFeature = "Customer Register"
    /** @type {import("../types/user.js").UserCustomer} */
    const registerPositivePayload = generateNewCustomer()

    const headers = {
        Authorization: `Bearer ${user.accessToken}`
    }

    /** @type {import("../helpers/request.js").RequestAssertResponse} */
    let res;

    if (!config.POSITIVE_CASE) {
        testPostJsonAssert(currentFeature, "empty headers", currentRoute, {}, headers, {
            ['should return 401']: (res) => res.status === 401,
        }, config, tags);
        testPostJsonAssert(currentFeature, "invalid authorization header", currentRoute, {}, { Authorization: `Bearer ${headers.Authorization}a`, }, {
            ['should return 401']: (res) => res.status === 401,
        }, config, tags);
        registerNegativePayloads(registerPositivePayload).forEach((payload) => {
            testPostJsonAssert(currentFeature, "invalid payload", currentRoute, payload, headers, {
                ['should return 400']: (res) => res.status === 400,
            }, config, tags);
        });
    }

    res = testPostJsonAssert(currentFeature, "register with correct payload", currentRoute, registerPositivePayload, headers, {
        ['should return 201']: (res) => res.status === 201,
        ['should return have a userId']: (res) => isExists(res, "data.userId"),
        ['should return have a phoneNumber']: (res) => isExists(res, "data.phoneNumber"),
        ['should return have a name']: (res) => isExists(res, "data.name"),
    }, config, tags);

    if (!config.POSITIVE_CASE) {
        testPostJsonAssert(currentFeature, "register with existing phone number", currentRoute, registerPositivePayload, headers, {
            ['should return 409']: (res) => res.status === 409,
        }, config, tags);
    }
    if (res.isSuccess) {
        return Object.assign(registerPositivePayload, { userId: res.res.json().data.userId })
    }
    return null
}

/**
 * 
 * @param {import("../config.js").Config} config 
 * @param {Object} tags
 * @param {import("../types/user.js").User} user 
 */
export function TestCustomerGet(user, config, tags) {
    const currentRoute = `${config.BASE_URL}/v1/customer`
    const currentFeature = "get customer"

    /** @type {import("../helpers/request.js").RequestAssertResponse} */
    let res;
    const headers = {}

    if (!config.LOAD_TEST) {
        res = testGetAssert(currentFeature, "get customer", currentRoute, {}, headers, {
            ['should return 200']: (res) => res.status === 200,
            ['should return have a userId']: (res) => isExists(res, "data.userId"),
            ['should return have a phoneNumber']: (res) => isExists(res, "data.phoneNumber"),
            ['should return have a name']: (res) => isExists(res, "data.name"),
        }, config, tags);
    } else {
        // limit search by name to prevent too many data
        let nameToSearch = generateRandomName()
        nameToSearch = nameToSearch.substring(0, nameToSearch.length - 6)
        res = testGetAssert(currentFeature, "get customer", currentRoute, {
            name: nameToSearch
        }, headers, {
            ['should return 200']: (res) => res.status === 200,
            ['should return have a userId']: (res) => isExists(res, "data.userId"),
            ['should return have a phoneNumber']: (res) => isExists(res, "data.phoneNumber"),
            ['should return have a name']: (res) => isExists(res, "data.name"),
        }, config, tags);
    }

    if (!config.POSITIVE_CASE) {
        const phoneNumberToAdd = `+${generateInternationalCallingCode()}${generateRandomNumber(1000000, 999999999)}`
        let phoneNumberToSearch = phoneNumberToAdd.substring(0, phoneNumberToAdd.length - 3)
        phoneNumberToSearch = phoneNumberToAdd.substring(1)
        let nameToSearch = generateRandomName()
        if (!nameToSearch.includes("c")) {
            nameToSearch = nameToSearch + "c"
        }

        const postFeatureRoute = `${config.BASE_URL}/v1/customer/register`
        const postFeatureHeaders = {
            Authorization: `Bearer ${user.accessToken}`
        }

        testPostJsonAssert(currentFeature, 'add customer with searched phone number', postFeatureRoute, {
            name: generateRandomName(),
            phoneNumber: phoneNumberToAdd,
        }, postFeatureHeaders, {
            ['should return 201']: (res) => res.status === 201,
        }, config, tags)
        testPostJsonAssert(currentFeature, 'add customer with searched name', postFeatureRoute, {
            name: nameToSearch,
            phoneNumber: `+${generateInternationalCallingCode()}${generateRandomNumber(1000000, 999999999)}`,
        }, postFeatureHeaders, {
            ['should return 201']: (res) => res.status === 201,
        }, config, tags)

        testGetAssert(currentFeature, 'get product with an "c" in the name', currentRoute, {
            name: "c"
        }, headers, {
            ['should return 200']: (res) => res.status === 200,
            ['should have an "c" in the result']: (res) => isEqualWith(res, 'data[].name', (v) => v.every(a => a.includes("c"))),
        }, config, tags);
        testGetAssert(currentFeature, 'get product with phone number', currentRoute, {
            phoneNumber: phoneNumberToSearch
        }, headers, {
            ['should return 200']: (res) => res.status === 200,
            ['should have an "c" in the result']: (res) => isEqualWith(res, 'data[].name', (v) => v.every(a => a.includes(phoneNumberToSearch))),
        }, config, tags);
    }


    if (res.isSuccess) {
        return res.res.json().data
    }
    return null

}

const customerCheckoutNegativePayloads = (positivePayload) => generateTestObjects({
    customerId: { type: "string", notNull: true },
    productDetails: { type: "array", notNull: true },
    paid: { type: "number", notNull: true, min: 1 },
    change: { type: "number", notNull: true, min: 0 },
}, positivePayload)

// TODO: create TestCustomerCheckout
export function TestCustomerCheckout(user, config, tags) {
    const currentRoute = `${config.BASE_URL}/v1/product/checkout`
    const getRoute = `${config.BASE_URL}/v1/customer`
    const currentFeature = "post product"

    if (!isUserValid(user)) {
        fail(`${currentFeature} Invalid user object`)
    }

    const headers = {
        Authorization: `Bearer ${user.accessToken}`
    }

    res = testGetAssert(currentFeature, "get customer", getRoute, {}, headers, {
        ['should return 200']: (res) => res.status === 200,
        ['should return have a userId']: (res) => isExists(res, "data.userId"),
        ['should return have a phoneNumber']: (res) => isExists(res, "data.phoneNumber"),
        ['should return have a name']: (res) => isExists(res, "data.name"),
    }, config, tags);
    if (!res.isSuccess) {
        fail(`${currentFeature}  Failed to get customer`)
    }

    /** @type {import("../types/user.js").UserCustomer[]} */
    const customers = res.res.json().data
    const customerToPay = customers[generateRandomNumber(0, customers.length - 1)]

    /** @type {import("../helpers/request.js").RequestAssertResponse} */
    let res;

    if (!config.POSITIVE_CASE) {
        testPostJsonAssert(currentFeature, "empty headers", currentRoute, {}, headers, {
            ['should return 401']: (res) => res.status === 401,
        }, config, tags);
        testPostJsonAssert(currentFeature, "invalid authorization header", currentRoute, {}, { Authorization: `Bearer ${headers.Authorization}a`, }, {
            ['should return 401']: (res) => res.status === 401,
        }, config, tags);
        productNegativePayload(productPositivePayload).forEach((payload) => {
            testPostJsonAssert(currentFeature, "invalid payload", currentRoute, payload, headers, {
                ['should return 400']: (res) => res.status === 400,
            }, config, tags);
        });
    }

    res = testPostJsonAssert(currentFeature, "add product with correct payload", currentRoute, productPositivePayload, headers, {
        ['should return 201']: (res) => res.status === 201,
        ['should have id']: (res) => isExists(res, 'data.id'),
        ['should have createdAt and format should be date']: (res) => isEqualWith(res, 'data.createdAt', (v) => v.every(a => isValidDate(a))),
    }, config, tags);

    if (res.isSuccess) {
        return Object.assign(productPositivePayload, {
            id: res.res.json().data.id,
            createdAt: res.res.json().data.createdAt
        })
    }
    return null
}

// TODO: create TestCustomerCheckoutHistory