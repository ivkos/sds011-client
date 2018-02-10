const Constants = require("./Constants");

class MessageUtils
{
    /**
     * Check if given buffer is a valid message of SDS011 sensor
     *
     * @param {Buffer} message - data message
     *
     * @return {boolean} - validity of message
     * @ignore
     */
    static isValidMessage(message) {
        if (message.length !== 10) return false;
        if (!this.hasValidHeadAndTail(message)) return false;
        if (!this.hasValidChecksum(message, 8, 2, 7)) return false;

        return true;
    }

    /**
     * Check if given message begins with correct head and ends with correct tail.
     *
     * @param {Buffer} message
     * @ignore
     */
    static hasValidHeadAndTail(message) {
        return (message[0] === Constants.MSG_HEAD) && (message[message.length - 1] === Constants.MSG_TAIL);
    }

    /**
     * Validates checksum in the incoming message.
     *
     * @param {Buffer} message
     * @param {int} checksumByteOffset - index of checksum
     * @param {int} dataStartOffset - index where data section begins in the message
     * @param {int} dataEndOffset - index where data section ends in the message
     * @ignore
     */
    static hasValidChecksum(message, checksumByteOffset, dataStartOffset, dataEndOffset) {
        return message[checksumByteOffset] === this.calculateChecksum(message, dataStartOffset, dataEndOffset);
    }

    static calculateChecksum(buf, start, end) {
        return buf
            .slice(start, end + 1)
            .reduce((r, v) => (r + v) & 0xFF, 0);
    };

    static calculateSensorIdBufFromString(str) {
        if (!str) return Buffer.from([0xFF, 0xFF]);

        str = "" + str;

        return Buffer.from([
            parseInt(str.slice(0, 2), 16),
            parseInt(str.slice(2, 4), 16)
        ]);
    };
}

module.exports = MessageUtils;