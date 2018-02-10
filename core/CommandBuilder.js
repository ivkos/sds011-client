const MessageUtils = require("./MessageUtils");
const Constants = require("./Constants");

class CommandBuilder
{
    static makeCommand(sensorId, sender, type, mode, arg) {
        const buf = Buffer.alloc(19);
        const idBuf = MessageUtils.calculateSensorIdBufFromString(sensorId);

        buf[0] = Constants.MSG_HEAD;

        buf[1] = sender & 0xFF;
        buf[2] = type & 0xFF;
        buf[3] = mode & 0xFF;
        buf[4] = arg & 0xFF;

        buf[15] = idBuf[0];
        buf[16] = idBuf[1];

        buf[17] = MessageUtils.calculateChecksum(buf, 2, 16);
        buf[18] = Constants.MSG_TAIL;

        return buf;
    }

    static query(sensorId) {
        return this.makeCommand(
            sensorId,
            Constants.SENDER_PC,
            Constants.CMD_QUERY,
            Constants.MODE_GET
        );
    }

    static setReportingMode(active, sensorId) {
        return this.makeCommand(
            sensorId,
            Constants.SENDER_PC,
            Constants.CMD_PMU_MODE,
            Constants.MODE_SET,
            !active
        );
    }

    static getReportingMode(sensorId) {
        return this.makeCommand(
            sensorId,
            Constants.SENDER_PC,
            Constants.CMD_PMU_MODE,
            Constants.MODE_GET
        );
    }

    static setPower(on, sensorId) {
        return this.makeCommand(
            sensorId,
            Constants.SENDER_PC,
            Constants.CMD_PMU_POWER,
            Constants.MODE_SET,
            on
        );
    }

    static getFirmware(sensorId) {
        return this.makeCommand(
            sensorId,
            Constants.SENDER_PC,
            Constants.CMD_FIRMWARE,
            Constants.MODE_GET
        )
    }

    static getPeriod(sensorId) {
        return this.makeCommand(
            sensorId,
            Constants.SENDER_PC,
            Constants.CMD_PERIOD,
            Constants.MODE_GET
        )
    }

    static setPeriod(period, sensorId) {
        return this.makeCommand(
            sensorId,
            Constants.SENDER_PC,
            Constants.CMD_PERIOD,
            Constants.MODE_SET,
            period
        )
    }
}

module.exports = CommandBuilder;