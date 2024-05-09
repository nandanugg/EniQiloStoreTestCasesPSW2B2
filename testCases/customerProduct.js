import { isEqualWith, isExists, isOrdered, isTotalDataInRange, isValidDate, isValidUrl } from "../helpers/assertion.js";
import { generateRandomBigInt, generateRandomName } from "../helpers/generator.js";
import { testGetAssert, testPostJsonAssert } from "../helpers/request.js";
import { generateProduct, getRandomCategory } from "../types/product.js";

/**
 * 
 * @param {import("../config.js").Config} config 
 * @param {Object} tags
 * @param {import("../types/user.js").User} user 
 */
export function TestCustomerProductGet(user, config, tags) {
    const currentRoute = "/v1/product/customer"
    const currentFeature = "get product customer"

    /** @type {import("../helpers/request.js").RequestAssertResponse} */
    let res;
    const headers = {}

    res = testGetAssert(currentFeature, "get product", currentRoute, {}, headers, {
        ['should return 200']: (res) => res.status === 200,
        ['should have id']: (res) => isExists(res, 'data[].id'),
        ['should have name']: (res) => isExists(res, 'data[].name'),
        ['should have sku']: (res) => isExists(res, 'data[].sku'),
        ['should have category']: (res) => isExists(res, 'data[].category'),
        ['should have imageUrl']: (res) => isEqualWith(res, 'data[].imageUrl', (v) => v.every(a => isValidUrl(a))),
        ['should have stock']: (res) => isExists(res, 'data[].stock'),
        ['should have price']: (res) => isExists(res, 'data[].price'),
        ['should have location']: (res) => isExists(res, 'data[].location'),
        ['should have createdAt']: (res) => isEqualWith(res, 'data[].createdAt', (v) => v.every(a => isValidDate(a))),
        ['should have return ordered by newest first']: (res) => isOrdered(res, 'data[].createdAt', 'desc', (v) => new Date(v)),
        ['should have no more than 5 data as default']: (res) => {
            try {
                if (res.json().data.length > 5) {
                    return false
                }
                return true;
            } catch (error) {
                return false
            }
        },
    }, config, tags);

    if (!config.POSITIVE_CASE) {
        const categoryToSearch = getRandomCategory()
        const skuToSearch = generateRandomBigInt(10000000000, 999999999999999999999999999999n)

        let nameToAdd = generateRandomName()
        if (!nameToAdd.includes("b")) {
            nameToAdd = nameToAdd + "b"
        }

        const postFeatureRoute = "/v1/product"
        const postFeatureHeaders = {
            Authorization: `Bearer ${user.accessToken}`
        }

        testPostJsonAssert(currentFeature, 'add product with searched category', postFeatureRoute, Object.assign(generateProduct(), {
            name: nameToAdd,
            category: categoryToSearch
        }), postFeatureHeaders, {
            ['should return 201']: (res) => res.status === 201,
        }, config, tags)
        testPostJsonAssert(currentFeature, 'add product with seached sku', postFeatureRoute, Object.assign(generateProduct(), {
            sku: skuToSearch
        }), postFeatureHeaders, {
            ['should return 201']: (res) => res.status === 201,
        }, config, tags)

        testGetAssert(currentFeature, 'get product with an "a" in the name', currentRoute, {
            name: "b"
        }, headers, {
            ['should return 200']: (res) => res.status === 200,
            ['should have an "b" in the result']: (res) => isEqualWith(res, 'data[].name', (v) => v.every(a => a.includes("a"))),
        }, config, tags);
        testGetAssert(currentFeature, 'get product filtered by category', currentRoute, {
            category: categoryToSearch
        }, headers, {
            ['should return 200']: (res) => res.status === 200,
            ['should have the category that is searced']: (res) => isEqualWith(res, 'data[].category', (v) => v.every(a => a === categoryToSearch)),
        }, config, tags);
        testGetAssert(currentFeature, 'get product filtered by sku', currentRoute, {
            category: categoryToSearch
        }, headers, {
            ['should return 200']: (res) => res.status === 200,
            ['should have the sku that is searced']: (res) => isEqualWith(res, 'data[].sku', (v) => v.every(a => a === skuToSearch)),
        }, config, tags);
        testGetAssert(currentFeature, 'get product sorted by price asc', currentRoute, {
            price: 'asc'
        }, headers, {
            ['should return 200']: (res) => res.status === 200,
            ['should have the sku that is searced']: (res) => isEqualWith(res, 'data[].sku', (v) => v.every(a => a === skuToSearch)),
        }, config, tags);
        const paginationRes = testGetAssert(currentFeature, 'get product filtered by pagination', currentRoute, {
            limit: 2,
            offset: 0
        }, headers, {
            ['should return 200']: (res) => res.status === 200,
            ['should have no more than 2 data as default']: (res) => isTotalDataInRange(res, 'data[]', 1, 2),

        }, config, tags);
        if (paginationRes.isSuccess) {
            testGetAssert(currentFeature, 'get product filtered by pagination and offset', currentRoute, {
                limit: 2,
                offset: 2
            }, headers, {
                ['should return 200']: (res) => res.status === 200,
                ['should have no more than 2 data as default']: (res) => isTotalDataInRange(res, 'data[]', 1, 2),
                ['should have a different data than offset 0']: (res) => {
                    try {
                        return res.json().data.every(e => {
                            return paginationRes.res.json().data.every(a => a.id !== e.id)
                        })
                    } catch (error) {
                        return false
                    }
                },
            }, config, tags);
        }
    }


    if (res.isSuccess) {
        return res.res.json().data
    }
    return null

}