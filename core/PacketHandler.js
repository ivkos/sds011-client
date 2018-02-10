const Constants = require("./Constants");

module.exports = {};

/**
 * 0xC0: PM2.5 and PM10 data
 *
 * @param {Buffer} data
 * @param {SensorState} state
 */

module.exports.handle0xC0 = (data, state) => {
    state.pm2p5 = ((data[3] * 256) + data[2]) / 10;
    state.pm10 = ((data[5] * 256) + data[4]) / 10;
};

/**
 * 0xC5: response to commands related to configuration setting
 * @param {Buffer} data
 * @param {SensorState} state
 */
module.exports.handle0xC5 = (data, state) => {
    const setting = data[2];

    switch (setting) {
        case Constants.CMD_PMU_MODE: // Response to "get/set mode" command
        {
            state.mode = (data[4] === 0 ? 'active' : 'query');
            break;
        }

        case Constants.CMD_PMU_POWER: // Response to "get/set sleep mode" command
        {
            state.isSleeping = (data[4] === 0);
            break;
        }

        case Constants.CMD_FIRMWARE: // Response to "get firmware version" command
        {
            const year = padLeft(data[3], 2);
            const month = padLeft(data[4], 2);
            const day = padLeft(data[5], 2);

            state.firmware = `${year}-${month}-${day}`;
            break;
        }

        case Constants.CMD_PERIOD: // Response to "get/set working period" command
        {
            state.workingPeriod = data[4];
            break;
        }

        default:
            throw new Error(`Unhandled command: ${setting}`);
    }
};

function padLeft(x, desiredSize, padding = "0") {
    return Array.from(Array(Math.max(0, desiredSize - String(x).length)), () => padding)
        .concat(Array.from(String(x)))
        .join("");
}