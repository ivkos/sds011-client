const assert = require('assert');
const SensorState = require('../core/sensor-state')
const rewire = require("rewire");

const PacketUtils = rewire("../core/packet-utils.js");

describe('Packet utiliites', function () {

    it('Rejects packet with wrong size (empty packet)', function () {
        let buffer = new Buffer([]);

        let res = PacketUtils.verifyPacket(buffer);

        assert.equal(res, false);
    });

    it('Checks for header and tail - when packet is valid', function () {
        let buffer = Buffer.from([0xAA, 0xC0, 0x4B, 0x00, 0x51, 0x00, 0xE9, 0x77, 0xFC, 0xAB]);

        let res = PacketUtils.__get__("verifyHeaderAndTail")(buffer);

        assert.equal(res, true);
    });

    it('Checks for header and tail - when packet is invalid', function () {
        let buffer = Buffer.from([0x00, 0xC0, 0x4B, 0x13]);

        let res = PacketUtils.__get__("verifyHeaderAndTail")(buffer);

        assert.equal(res, false);
    });

    it('Validates checksum - when packet is valid', function () {
        let buffer = Buffer.from([0xAA, 0xC0, 0x4B, 0x00, 0x51, 0x00, 0xE9, 0x77, 0xFC, 0xAB]);

        let res = PacketUtils.__get__("isChecksumValid")(buffer, 8, 2, 7);

        assert.equal(res, true);
    });

    it('Validates checksum - when packet is invalid', function () {
        let buffer = Buffer.from([0xAA, 0xC0, 0x4A, 0x00, 0x5A, 0x00, 0xEA, 0x7A, 0xFA, 0xAB]);

        let res = PacketUtils.__get__("isChecksumValid")(buffer, 8, 2, 7);

        assert.equal(res, false);
    });

});