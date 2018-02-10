/**
 * Calculates and updates checksum for outgoing packet.
 *
 * @param {Array<Number>|Buffer} command - array containing command packet
 * @ignore
 */
module.exports.addChecksumToCommandArray = function addChecksumToCommandArray(command) {
    command[17] = calculateChecksum(command, 2, 16);
}

/**
 * Check if given buffer is a valid packet of SDS011 sensor
 *
 * @param {Buffer} packet - data packet
 *
 * @return {bool} - validity of packet
 * @ignore
 */
module.exports.verifyPacket = function (packet) {
    if (packet.length !== 10)
        return false;

    if (!verifyHeaderAndTail(packet))
        return false;

    if (!isChecksumValid(packet, 8, 2, 7))
        return false

    return true;
}

/**
 * Check if given packet begins with correct header and ends with correct tail.
 *
 * @param {Buffer} packet
 * @ignore
 */
function verifyHeaderAndTail(packet) {
    const header = packet[0];
    const tail = packet[packet.length - 1];

    return (header === 0xAA) && (tail === 0xAB);
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
function isChecksumValid(packet, checksumByteOffset, dataStartOffset, dataEndOffset) {
    return packet[checksumByteOffset] === calculateChecksum(packet, dataStartOffset, dataEndOffset);
}

function calculateChecksum(buf, start, end) {
    return buf
        .slice(start, end + 1)
        .reduce((r, v) => (r + v) & 0xFF, 0);
}