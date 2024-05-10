import { fail } from "k6";
import { isEqualWith, isExists } from "../helpers/assertion.js";
import { generateRandomName, generateRandomNumber, generateTestObjects } from "../helpers/generator.js";
import { testGetAssert, testPostJsonAssert } from "../helpers/request.js";
import { generateInternationalCallingCode, isUserValid } from "../types/user.js";
import { generateProduct } from "../types/product.js";

const registerCustomerNegativePayloads = (positivePayload) => generateTestObjects({
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
    const registerCustomerPositivePayload = generateNewCustomer()

    const headers = {
        Authorization: `Bearer ${user.accessToken}`
    }

    /** @type {import("../helpers/request.js").RequestAssertResponse} */
    let res;

    if (!config.POSITIVE_CASE) {
        testPostJsonAssert(currentFeature, "empty headers", currentRoute, {}, {}, {
            ['should return 401']: (res) => res.status === 401,
        }, config, tags);
        testPostJsonAssert(currentFeature, "invalid authorization header", currentRoute, {}, { Authorization: `Bearer ${headers.Authorization}a`, }, {
            ['should return 401']: (res) => res.status === 401,
        }, config, tags);
        registerCustomerNegativePayloads(registerCustomerPositivePayload).forEach((payload) => {
            testPostJsonAssert(currentFeature, "invalid payload", currentRoute, payload, headers, {
                ['should return 400']: (res) => res.status === 400,
            }, config, tags);
        });
    }

    res = testPostJsonAssert(currentFeature, "register with correct payload", currentRoute, registerCustomerPositivePayload, headers, {
        ['should return 201']: (res) => res.status === 201,
        ['should return have a userId']: (res) => isExists(res, "data.userId"),
        ['should return have a phoneNumber']: (res) => isExists(res, "data.phoneNumber"),
        ['should return have a name']: (res) => isExists(res, "data.name"),
    }, config, tags);

    if (!config.POSITIVE_CASE) {
        testPostJsonAssert(currentFeature, "register with existing phone number", currentRoute, registerCustomerPositivePayload, headers, {
            ['should return 409']: (res) => res.status === 409,
        }, config, tags);
    }
    if (res.isSuccess) {
        return Object.assign(registerCustomerPositivePayload, { userId: res.res.json().data.userId })
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
    productDetails: {
        type: "array", notNull: true, items: {
            type: "object",
            properties: {
                productId: { type: "string", notNull: true },
                quantity: { type: "number", notNull: true, min: 1 }
            }
        }
    },
    paid: { type: "number", notNull: true, min: 1 },
    change: { type: "number", notNull: true, min: 0 },
}, positivePayload)
/** 
 * @typedef {Object} ProductCheckout
 * @property {string} customerId - The id of the customer
 * @property {number} quantity - The quantity of the product
 */
export function TestCustomerCheckout(user, config, tags) {
    const currentRoute = `${config.BASE_URL}/v1/product/checkout`
    const currentFeature = "customer checkout"

    if (!isUserValid(user)) {
        fail(`${currentFeature} Invalid user object`)
    }

    const headers = {
        Authorization: `Bearer ${user.accessToken}`
    }

    res = testGetAssert(currentFeature, "get customer", `${config.BASE_URL}/v1/customer`, {}, headers, {
        ['should return 200']: (res) => res.status === 200,
    }, config, tags);
    if (!res.isSuccess) {
        fail(`${currentFeature}  Failed to get customer`)
    }
    /** @type {import("../types/user.js").UserCustomer[]} */
    const customers = res.res.json().data
    const customerToPay = customers[generateRandomNumber(0, customers.length - 1)]

    res = testGetAssert(currentFeature, "get product", `${config.BASE_URL}/v1/product`, {}, headers, {
        ['should return 200']: (res) => res.status === 200,
    }, config, tags);
    if (!res.isSuccess) {
        fail(`${currentFeature}  Failed to get product`)
    }
    /** @type {import("../types/product.js").Product[]} */
    const products = res.res.json().data
    let productsIndexToBuy = []
    for (let i = 0; i < generateRandomNumber(1, 4); i++) {
        productsIndexToBuy.push(generateRandomNumber(0, products.length - 1))
    }
    productsIndexToBuy = [...new Set(productsIndexToBuy)]
    /** @type {ProductCheckout[]} */
    const productsToBuy = []
    /** @type {ProductCheckout[]} */
    const productsToBuyButQuantityIsNotEnough = []
    let totalPrice = 0
    productsIndexToBuy.forEach(i => {
        const product = products[i]
        const quantity = generateRandomNumber(1, product.stock)
        totalPrice += product.price * quantity
        productsToBuy.push({
            productId: product.id,
            quantity
        })
        productsToBuyButQuantityIsNotEnough.push({
            productId: product.id,
            quantity: quantity + 100000
        })
    });

    const customerCheckoutPositivePayload = {
        customerId: customerToPay.userId,
        productDetails: productsToBuy,
        paid: totalPrice,
        change: 0
    }

    /** @type {import("../helpers/request.js").RequestAssertResponse} */
    let res;

    if (!config.POSITIVE_CASE) {
        testPostJsonAssert(currentFeature, "empty headers", currentRoute, {}, {}, {
            ['should return 401']: (res) => res.status === 401,
        }, config, tags);
        testPostJsonAssert(currentFeature, "invalid authorization header", currentRoute, {}, { Authorization: `Bearer ${headers.Authorization}a`, }, {
            ['should return 401']: (res) => res.status === 401,
        }, config, tags);
        customerCheckoutNegativePayloads(customerCheckoutPositivePayload).forEach((payload) => {
            testPostJsonAssert(currentFeature, "invalid payload", currentRoute, payload, headers, {
                ['should return 400']: (res) => res.status === 400,
            }, config, tags);
        });
        testPostJsonAssert(currentFeature, "productId is not found", currentRoute, Object.assign(customerCheckoutPositivePayload, {
            productDetails: [{
                productId: "notfound",
                quantity: 1
            }]
        }), headers, {
            ['should return 404']: (res) => res.status === 404,
        }, config, tags);

        testPostJsonAssert(currentFeature, "paid is not enough", currentRoute, Object.assign(customerCheckoutPositivePayload, {
            paid: totalPrice - 1
        }), headers, {
            ['should return 400']: (res) => res.status === 400,
        }, config, tags);

        testPostJsonAssert(currentFeature, "change is not right", currentRoute, Object.assign(customerCheckoutPositivePayload, {
            paid: totalPrice + 10,
            change: 0
        }), headers, {
            ['should return 400']: (res) => res.status === 400,
        }, config, tags);

        testPostJsonAssert(currentFeature, "one of product ids is not enough", currentRoute, Object.assign(customerCheckoutPositivePayload, {
            productDetails: productsToBuyButQuantityIsNotEnough
        }), headers, {
            ['should return 400']: (res) => res.status === 400,
        }, config, tags);


        const productIsAvailabeFalseToAdd = Object.assign(generateProduct(), {
            isAvailable: false,
        })
        res = testPostJsonAssert(currentFeature, 'add product with searched category', `${config.BASE_URL}/v1/product`, productIsAvailabeFalseToAdd, headers, {
            ['should return 201']: (res) => res.status === 201,
        }, config, tags)

        if (!res.isSuccess) {
            fail(`${currentFeature}  Failed to add product with isAvailable == false`)
        }
        const productIdIsAvailableFalse = res.res.json().data.id
        /** @type {ProductCheckout[]} */
        const productToBuyButOneItemIsAvailableFalse = [...productsToBuy, {
            productId: productIdIsAvailableFalse,
            quantity: productIsAvailabeFalseToAdd.stock - 1
        }]
        testPostJsonAssert(currentFeature, "one of product isAvailable == false", currentRoute, productToBuyButOneItemIsAvailableFalse, headers, {
            ['should return 400']: (res) => res.status === 400,
        }, config, tags);
    }

    res = testPostJsonAssert(currentFeature, "checkout with correct payload", currentRoute, customerCheckoutPositivePayload, headers, {
        ['should return 200']: (res) => res.status === 200,
    }, config, tags);

    if (res.isSuccess && !config.POSITIVE_CASE) {
        productsToBuy.forEach(product => {
            res = testGetAssert(currentFeature, "get product that already been checkouted", `${config.BASE_URL}/v1/product`, {
                id: product.productId
            }, headers, {
                ['should return 200']: (res) => res.status === 200,
                ['quantity should be less than previous get product']: (res) => isEqualWith(res, 'data[].stock', (v) => v.every(a => a < product.quantity)),
            }, config, tags);
        });
    }

    return null
}

export function TestCustomerCheckoutHistory(user, config, tags) {
    const currentRoute = `${config.BASE_URL}/v1/product/checkout/history`
    const currentFeature = "get customer product checkout history"

    if (!isUserValid(user)) {
        fail(`${currentFeature} Invalid user object`)
    }

    const headers = {
        Authorization: `Bearer ${user.accessToken}`
    }

    res = testGetAssert(currentFeature, "get customer", `${config.BASE_URL}/v1/customer`, {}, headers, {
        ['should return 200']: (res) => res.status === 200,
    }, config, tags);
    if (!res.isSuccess) {
        fail(`${currentFeature}  Failed to get customer`)
    }
    /** @type {import("../types/user.js").UserCustomer[]} */
    const customers = res.res.json().data
    const customerToPay = customers[generateRandomNumber(0, customers.length - 1)]

    res = testGetAssert(currentFeature, "get product", `${config.BASE_URL}/v1/product`, {}, headers, {
        ['should return 200']: (res) => res.status === 200,
    }, config, tags);
    if (!res.isSuccess) {
        fail(`${currentFeature}  Failed to get product`)
    }
    /** @type {import("../types/product.js").Product[]} */
    const products = res.res.json().data
    let productsIndexToBuy = []
    for (let i = 0; i < generateRandomNumber(1, 4); i++) {
        productsIndexToBuy.push(generateRandomNumber(0, products.length - 1))
    }
    productsIndexToBuy = [...new Set(productsIndexToBuy)]

    const productsToBuy = []
    const productsToBuyButQuantityIsNotEnough = []
    let totalPrice = 0
    productsIndexToBuy.forEach(i => {
        const product = products[i]
        const quantity = generateRandomNumber(1, product.stock)
        totalPrice += product.price * quantity
        productsToBuy.push({
            productId: product.id,
            quantity
        })
        productsToBuyButQuantityIsNotEnough.push({
            productId: product.id,
            quantity: quantity + 100000
        })
    });

    const checkoutPositivePayload = {
        customerId: customerToPay.userId,
        productDetails: productsToBuy,
        paid: totalPrice,
        change: 0
    }

    /** @type {import("../helpers/request.js").RequestAssertResponse} */
    let res;

    if (!config.POSITIVE_CASE) {
        testPostJsonAssert(currentFeature, "empty headers", currentRoute, {}, {}, {
            ['should return 401']: (res) => res.status === 401,
        }, config, tags);
        testPostJsonAssert(currentFeature, "invalid authorization header", currentRoute, {}, { Authorization: `Bearer ${headers.Authorization}a`, }, {
            ['should return 401']: (res) => res.status === 401,
        }, config, tags);
        customerCheckoutNegativePayloads(checkoutPositivePayload).forEach((payload) => {
            testPostJsonAssert(currentFeature, "invalid payload", currentRoute, payload, headers, {
                ['should return 400']: (res) => res.status === 400,
            }, config, tags);
        });
        testPostJsonAssert(currentFeature, "productId is not found", currentRoute, Object.assign(checkoutPositivePayload, {
            productDetails: [{
                productId: "notfound",
                quantity: 1
            }]
        }), headers, {
            ['should return 404']: (res) => res.status === 404,
        }, config, tags);

        testPostJsonAssert(currentFeature, "paid is not enough", currentRoute, Object.assign(checkoutPositivePayload, {
            paid: totalPrice - 1
        }), headers, {
            ['should return 400']: (res) => res.status === 400,
        }, config, tags);

        testPostJsonAssert(currentFeature, "change is not right", currentRoute, Object.assign(checkoutPositivePayload, {
            paid: totalPrice + 10,
            change: 0
        }), headers, {
            ['should return 400']: (res) => res.status === 400,
        }, config, tags);

        testPostJsonAssert(currentFeature, "one of product ids is not enough", currentRoute, Object.assign(checkoutPositivePayload, {
            productDetails: productsToBuyButQuantityIsNotEnough
        }), headers, {
            ['should return 400']: (res) => res.status === 400,
        }, config, tags);


        const productIsAvailabeFalseToAdd = Object.assign(generateProduct(), {
            isAvailable: false,
        })
        res = testPostJsonAssert(currentFeature, 'add product with searched category', `${config.BASE_URL}/v1/product`, productIsAvailabeFalseToAdd, headers, {
            ['should return 201']: (res) => res.status === 201,
        }, config, tags)

        if (!res.isSuccess) {
            fail(`${currentFeature}  Failed to add product with isAvailable == false`)
        }
        const productIdIsAvailableFalse = res.res.json().data.id
        const productToBuyButOneItemIsAvailableFalse = [productsToBuy, {
            productId: productIdIsAvailableFalse,
            quantity: productIsAvailabeFalseToAdd.stock - 1
        }]
        testPostJsonAssert(currentFeature, "one of product isAvailable == false", currentRoute, productToBuyButOneItemIsAvailableFalse, headers, {
            ['should return 400']: (res) => res.status === 400,
        }, config, tags);
    }

    res = testPostJsonAssert(currentFeature, "checkout with correct payload", currentRoute, checkoutPositivePayload, headers, {
        ['should return 200']: (res) => res.status === 200,
    }, config, tags);

    return null
}

// TODO: create TestCustomerCheckoutHistory