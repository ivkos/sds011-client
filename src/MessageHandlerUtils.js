const Constants = require("./Constants");

class MessageHandlerUtils
{
    static get HANDLERS() {
        return {
            [Constants.SENDER_SENSOR_READING]: this.handleReading,
            [Constants.SENDER_SENSOR_CONFIG]: this.handleConfig
        }
    };

    static handle(message, state) {
        const sender = message[1];
        const handler = this.HANDLERS[sender];

        if (!handler) {
            throw new Error(`Cannot handle message with 0x${Number(sender).toString(16).toUpperCase()} sender`);
        }

        handler.apply(this, arguments);
    }

    static handleReading(data, state) {
        state.pm2p5 = ((data[3] * 256) + data[2]) / 10;
        state.pm10 = ((data[5] * 256) + data[4]) / 10;
    };

    static handleConfig(data, state) {
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
                const year = this.padLeft(data[3], 2);
                const month = this.padLeft(data[4], 2);
                const day = this.padLeft(data[5], 2);

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

    static padLeft(x, desiredSize, padding = "0") {
        return Array.from(Array(Math.max(0, desiredSize - String(x).length)), () => padding)
            .concat(Array.from(String(x)))
            .join("");
    }
}

module.exports = MessageHandlerUtils;