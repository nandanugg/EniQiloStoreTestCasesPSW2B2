/* eslint-disable no-undef */
import { config } from './config.js';
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
        { target: 250, iterations: 1, duration: "20m" },
        { target: 300, iterations: 1, duration: "20m" },
        { target: 600, iterations: 1, duration: "20m" }
    );
} else {
    stages.push({
        target: 1,
        iterations: 1
    });
}

export const options = {
    stages,
    summaryTrendStats: ['avg', 'min', 'med', 'max', 'p(95)', 'p(99)'],
};

// const positiveCaseConfig = Object.assign(clone(config), {
//     POSITIVE_CASE: true
// })


function calculatePercentage(percentage, totalVUs) {
    return (__VU - 1) % Math.ceil(totalVUs / Math.round(totalVUs * percentage)) === 0;
}


export default function () {
    // let currentUser;
    let tags = {}
    const currentTarget = options.stages[0].target;
    const currentStage = options.stages[0]; // Get the current stage
    const totalVUs = currentStage.target; // Total VUs for the current stage

    if (config.LOAD_TEST) {
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
