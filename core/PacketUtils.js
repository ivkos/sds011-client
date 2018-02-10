const Constants = require("./Constants");

class PacketUtils
{
    /**
     * Calculates and updates checksum for outgoing packet.
     *
     * @param {Array<Number>|Buffer} command - array containing command packet
     * @ignore
     */
    static addChecksumToCommandArray(command) {
        command[17] = this.calculateChecksum(command, 2, 16);
    }

    /**
     * Check if given buffer is a valid packet of SDS011 sensor
     *
     * @param {Buffer} packet - data packet
     *
     * @return {boolean} - validity of packet
     * @ignore
     */
    static verifyPacket(packet) {
        if (packet.length !== 10) return false;
        if (!this.verifyHeadAndTail(packet)) return false;
        if (!this.isChecksumValid(packet, 8, 2, 7)) return false;

        return true;
    }

    /**
     * Check if given packet begins with correct head and ends with correct tail.
     *
     * @param {Buffer} packet
     * @ignore
     */
    static verifyHeadAndTail(packet) {
        return (packet[0] === Constants.MSG_HEAD) && (packet[packet.length - 1] === Constants.MSG_TAIL);
    }

    /**
     * Validates checksum in the incoming packet.
     *
     * @param {Buffer} packet
     * @param {int} checksumByteOffset - index of checksum
     * @param {int} dataStartOffset - index where data section begins in the packet
     * @param {int} dataEndOffset - index where data section ends in the packet
     * @ignore
     */
    static isChecksumValid(packet, checksumByteOffset, dataStartOffset, dataEndOffset) {
        return packet[checksumByteOffset] === this.calculateChecksum(packet, dataStartOffset, dataEndOffset);
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

module.exports = PacketUtils;