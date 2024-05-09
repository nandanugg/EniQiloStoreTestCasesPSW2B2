/* eslint-disable no-undef */
import config from './config.js';
import { generateRandomNumber } from './helpers/generator.js';
import { TestLogin } from './testCases/authLogin.js';
import { TestRegister } from './testCases/authRegister.js';
import { TestProductManagementDelete, TestProductManagementGet, TestProductManagementPost, TestProductManagementPut } from './testCases/productManagement.js';
import { generateInternationalCallingCode } from './types/user.js';

export const options = {
    stages: [],
    summaryTrendStats: ['avg', 'min', 'med', 'max', 'p(95)', 'p(99)'],
};

// Ramping up from 50 VUs to 300 VUs if __ENV.LOAD_TEST is true
// eslint-disable-next-line no-undef
if (__ENV.LOAD_TEST) {
    options.stages.push(
        { target: 50, iterations: 1, duration: "15s" },
        { target: 100, iterations: 1, duration: "15s" },
        { target: 150, iterations: 1, duration: "30s" },
        { target: 200, iterations: 1, duration: "50s" },
        { target: 250, iterations: 1, duration: "1m" },
        { target: 300, iterations: 1, duration: "1m" },
        { target: 600, iterations: 1, duration: "1m" }
    );
} else {
    options.stages.push({
        target: 1,
        iterations: 1
    });
}
// const positiveCaseConfig = Object.assign(config, {
//     POSITIVE_CASE: true
// })

export default function () {
    // let currentUser;
    let tags = {}
    // const currentTarget = options.stages[0].target;
    // const currentStage = options.stages[0]; // Get the current stage
    // const totalVUs = currentStage.target; // Total VUs for the current stage
    // const percentageVUs10 = (__VU - 1) % Math.ceil(totalVUs / Math.round(totalVUs * 0.1)) === 0; // Calculate 10% of total VUs
    // const percentageVUs20 = (__VU - 1) % Math.ceil(totalVUs / Math.round(totalVUs * 0.2)) === 0; // Calculate 20% of total VUs
    // const percentageVUs30 = (__VU - 1) % Math.ceil(totalVUs / Math.round(totalVUs * 0.3)) === 0; // Calculate 30% of total VUs
    // const percentageVUs40 = (__VU - 1) % Math.ceil(totalVUs / Math.round(totalVUs * 0.4)) === 0; // Calculate 40% of total VUs
    // const percentageVUs50 = (__VU - 1) % Math.ceil(totalVUs / Math.round(totalVUs * 0.5)) === 0; // Calculate 50% of total VUs
    // const percentageVUs60 = (__VU - 1) % Math.ceil(totalVUs / Math.round(totalVUs * 0.6)) === 0; // Calculate 60% of total VUs
    // const percentageVUs70 = (__VU - 1) % Math.ceil(totalVUs / Math.round(totalVUs * 0.7)) === 0; // Calculate 70% of total VUs
    // const percentageVUs80 = (__VU - 1) % Math.ceil(totalVUs / Math.round(totalVUs * 0.8)) === 0; // Calculate 80% of total VUs
    // const percentageVUs90 = (__VU - 1) % Math.ceil(totalVUs / Math.round(totalVUs * 0.9)) === 0; // Calculate 90% of total VUs


    console.log(generateInternationalCallingCode())

    // let user = TestRegister(config, tags)
    // if (user) {
    //     user = TestLogin(user, config, tags)
    //     TestProductManagementPost(user, config, tags)
    //     TestProductManagementGet(user, config, tags)
    //     TestProductManagementPut(user, config, tags)
    //     TestProductManagementDelete(user, config, tags)
    // }
}
