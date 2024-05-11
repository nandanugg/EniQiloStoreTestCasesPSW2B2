/* eslint-disable no-undef */
import { config } from './config.js';
import { clone, generateRandomNumber } from './helpers/generator.js';
import { TestLogin } from './testCases/authLogin.js';
import { TestRegister } from './testCases/authRegister.js';
import { TestCustomerCheckout, TestCustomerCheckoutHistory, TestCustomerGet, TestCustomerRegister } from './testCases/productCheckout.js';
import { TestCustomerGetProduct } from './testCases/productCustomer.js';
import { TestProductManagementDelete, TestProductManagementGet, TestProductManagementPost, TestProductManagementPut } from './testCases/productManagement.js';

const stages = []

if (config.LOAD_TEST) {
    stages.push(
        { target: 50, iterations: 1, duration: "5s" },
        { target: 100, iterations: 1, duration: "15s" },
        { target: 150, iterations: 1, duration: "20s" },
        { target: 200, iterations: 1, duration: "20s" },
        { target: 250, iterations: 1, duration: "20s" },
        { target: 300, iterations: 1, duration: "20s" },
        { target: 600, iterations: 1, duration: "20s" }
    );
} else {
    stages.push({
        target: 1,
        iterations: 1
    });
}

export const options = {
    stages,
    // summaryTrendStats: ['avg', 'min', 'med', 'max', 'p(95)', 'p(99)'],
};

const positiveCaseConfig = Object.assign(clone(config), {
    POSITIVE_CASE: true
})


function calculatePercentage(percentage, totalVUs) {
    return (__VU - 1) % Math.ceil(totalVUs / Math.round(totalVUs * percentage)) === 0;
}


const users = []
function getRandomUser() {
    const i = generateRandomNumber(0, users.length - 1)
    return users[i]
}


export default function () {
    // let currentUser;
    let tags = {}
    const currentTarget = options.stages[0].target;
    const currentStage = options.stages[0]; // Get the current stage
    const totalVUs = currentStage.target; // Total VUs for the current stage

    if (config.LOAD_TEST) {
        if (currentTarget == 50) {
            let user = TestRegister(positiveCaseConfig, tags)
            users.push(user)
            for (let i = 0; i < 10; i++) {
                TestProductManagementPost(getRandomUser(), positiveCaseConfig, tags)
                TestProductManagementGet(getRandomUser(), positiveCaseConfig, tags)
            }
            if (calculatePercentage(0.5, totalVUs)) {
                TestProductManagementPut(getRandomUser(), positiveCaseConfig, tags)
            }
            if (calculatePercentage(0.1, totalVUs)) {
                TestProductManagementDelete(getRandomUser(), positiveCaseConfig, tags)
            }
            for (let i = 0; i < 20; i++) {
                TestCustomerGetProduct(getRandomUser(), positiveCaseConfig, tags)
            }

            if (calculatePercentage(0.5, totalVUs)) {
                TestCustomerRegister(getRandomUser(), positiveCaseConfig, tags)
                TestCustomerCheckout(getRandomUser(), positiveCaseConfig, tags)
            }

        } else if (currentTarget == 100) {
            if (calculatePercentage(0.5, totalVUs)) {
                let user = TestRegister(positiveCaseConfig, tags)
                users.push(user)
            }
            TestLogin(getRandomUser(), tags)
            for (let i = 0; i < 10; i++) {
                TestProductManagementPost(getRandomUser(), positiveCaseConfig, tags)
                TestProductManagementGet(getRandomUser(), positiveCaseConfig, tags)
            }
            if (calculatePercentage(0.5, totalVUs)) {
                TestProductManagementPut(getRandomUser(), positiveCaseConfig, tags)
            }
            if (calculatePercentage(0.1, totalVUs)) {
                TestProductManagementDelete(getRandomUser(), positiveCaseConfig, tags)
            }
            for (let i = 0; i < 20; i++) {
                TestCustomerGetProduct(getRandomUser(), positiveCaseConfig, tags)
            }

            if (calculatePercentage(0.5, totalVUs)) {
                TestCustomerRegister(getRandomUser(), positiveCaseConfig, tags)
                TestCustomerCheckout(getRandomUser(), positiveCaseConfig, tags)
            }
        } else if (currentTarget == 200) {
            if (calculatePercentage(0.1, totalVUs)) {
                let user = TestRegister(positiveCaseConfig, tags)
                users.push(user)
            }
            TestLogin(getRandomUser(), tags)
            for (let i = 0; i < 10; i++) {
                if (calculatePercentage(0.2, totalVUs)) {
                    TestProductManagementPost(getRandomUser(), positiveCaseConfig, tags)
                }
                TestProductManagementGet(getRandomUser(), positiveCaseConfig, tags)
            }
            if (calculatePercentage(0.8, totalVUs)) {
                TestProductManagementPut(getRandomUser(), positiveCaseConfig, tags)
            }
            if (calculatePercentage(0.1, totalVUs)) {
                TestProductManagementDelete(getRandomUser(), positiveCaseConfig, tags)
            }
            for (let i = 0; i < 30; i++) {
                if (calculatePercentage(0.5, totalVUs)) {
                    TestCustomerGetProduct(getRandomUser(), positiveCaseConfig, tags)
                } else {
                    TestCustomerGetProduct(getRandomUser(), config, tags)
                }
            }

            if (calculatePercentage(0.6, totalVUs)) {
                TestCustomerRegister(getRandomUser(), config, tags)
                TestCustomerCheckout(getRandomUser(), config, tags)
            }

            if (calculatePercentage(0.1, totalVUs)) {
                TestCustomerCheckoutHistory(user, productCheckout, positiveCaseConfig, tags)
            }
        } else if (currentTarget == 300) {
            TestLogin(getRandomUser(), tags)
            for (let i = 0; i < 5; i++) {
                TestProductManagementGet(getRandomUser(), positiveCaseConfig, tags)
            }
            if (calculatePercentage(0.8, totalVUs)) {
                TestProductManagementPut(getRandomUser(), positiveCaseConfig, tags)
            }
            if (calculatePercentage(0.1, totalVUs)) {
                TestProductManagementDelete(getRandomUser(), positiveCaseConfig, tags)
            }
            for (let i = 0; i < 60; i++) {
                if (calculatePercentage(0.5, totalVUs)) {
                    TestCustomerGetProduct(getRandomUser(), positiveCaseConfig, tags)
                } else {
                    TestCustomerGetProduct(getRandomUser(), config, tags)
                }
            }

            if (calculatePercentage(0.7, totalVUs)) {
                TestCustomerRegister(getRandomUser(), config, tags)
                TestCustomerCheckout(getRandomUser(), config, tags)
            }

            if (calculatePercentage(0.1, totalVUs)) {
                TestCustomerCheckoutHistory(user, productCheckout, positiveCaseConfig, tags)
            }
        } else if (currentTarget == 600) {
            TestLogin(getRandomUser(), tags)
            for (let i = 0; i < 5; i++) {
                TestProductManagementGet(getRandomUser(), positiveCaseConfig, tags)
            }
            if (calculatePercentage(0.8, totalVUs)) {
                TestProductManagementPut(getRandomUser(), positiveCaseConfig, tags)
            }
            if (calculatePercentage(0.1, totalVUs)) {
                TestProductManagementDelete(getRandomUser(), positiveCaseConfig, tags)
            }
            for (let i = 0; i < 120; i++) {
                if (calculatePercentage(0.5, totalVUs)) {
                    TestCustomerGetProduct(getRandomUser(), positiveCaseConfig, tags)
                } else {
                    TestCustomerGetProduct(getRandomUser(), config, tags)
                }
            }

            if (calculatePercentage(0.7, totalVUs)) {
                TestCustomerRegister(getRandomUser(), config, tags)
                TestCustomerCheckout(getRandomUser(), config, tags)
            }

            if (calculatePercentage(0.1, totalVUs)) {
                TestCustomerCheckoutHistory(user, productCheckout, positiveCaseConfig, tags)
            }
        }

    } else {
        let user = TestRegister(config, tags)
        if (user) {
            user = TestLogin(user, config, tags)
            TestProductManagementPost(user, config, tags)
            TestProductManagementGet(user, config, tags)
            TestProductManagementPut(user, config, tags)
            TestProductManagementDelete(user, config, tags)

            TestCustomerGetProduct(user, config, tags)
            TestCustomerRegister(user, config, tags)
            TestCustomerGet(user, config, tags)
            const productCheckout = TestCustomerCheckout(user, config, tags)
            TestCustomerCheckoutHistory(user, productCheckout, config, tags)
        }
    }
}
