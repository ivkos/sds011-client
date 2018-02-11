const assert = require('assert');
const MessageUtils = require("../src/MessageUtils.js");

describe('Message utiliites', function () {
    it('Rejects message with wrong size - empty message', function () {
        let buffer = new Buffer([]);

        let res = MessageUtils.isValidMessage(buffer);

        assert.equal(res, false);
    });

    it('Rejects message - invalid head and tail', function () {
        let buffer = Buffer.from([0x00, 0xC0, 0x4B, 0x00, 0x51, 0x00, 0xE9, 0x77, 0xFC, 0x00]);

        let res = MessageUtils.isValidMessage(buffer);

        assert.equal(res, false);
    });

    it('Accepts message - valid head and tail', function () {
        let buffer = Buffer.from([0xAA, 0xC0, 0x4B, 0x00, 0x51, 0x00, 0xE9, 0x77, 0xFC, 0xAB]);

        let res = MessageUtils.isValidMessage(buffer);

        assert.equal(res, true);
    });

    it('Rejects message - invalid checksum', function () {
        let buffer = Buffer.from([0xAA, 0xC0, 0x4B, 0x00, 0x50, 0x00, 0xE9, 0x77, 0xFC, 0xAB]);

        let res = MessageUtils.isValidMessage(buffer);

        assert.equal(res, false);
    });

    it('Accepts message - valid checksum', function () {
        let buffer = Buffer.from([0xAA, 0xC0, 0x4B, 0x00, 0x51, 0x00, 0xE9, 0x77, 0xFC, 0xAB]);

        let res = MessageUtils.isValidMessage(buffer);

        assert.equal(res, true);
    });

    it('Checks for head and tail - when message is valid', function () {
        let buffer = Buffer.from([0xAA, 0xC0, 0x4B, 0x00, 0x51, 0x00, 0xE9, 0x77, 0xFC, 0xAB]);

        let res = MessageUtils.hasValidHeadAndTail(buffer);

        assert.equal(res, true);
    });

    it('Checks for head and tail - when message is invalid', function () {
        let buffer = Buffer.from([0x00, 0xC0, 0x4B, 0x13]);

        let res = MessageUtils.hasValidHeadAndTail(buffer);

        assert.equal(res, false);
    });

    it('Validates checksum - when message is valid', function () {
        let buffer = Buffer.from([0xAA, 0xC0, 0x4B, 0x00, 0x51, 0x00, 0xE9, 0x77, 0xFC, 0xAB]);

        let res = MessageUtils.hasValidChecksum(buffer, 8, 2, 7);

        assert.equal(res, true);
    });

    it('Validates checksum - when message is invalid', function () {
        let buffer = Buffer.from([0xAA, 0xC0, 0x4A, 0x00, 0x5A, 0x00, 0xEA, 0x7A, 0xFA, 0xAB]);

        let res = MessageUtils.hasValidChecksum(buffer, 8, 2, 7);

        assert.equal(res, false);
    });

    it('Returns generic sensor ID when one is not supplied', function() {
       const result = MessageUtils.calculateSensorIdBufFromString();
       assert.ok(result.equals(Buffer.from([0xFF, 0xFF])));
    });

    it('Parses sensor ID correctly', function() {
        const result = MessageUtils.calculateSensorIdBufFromString("cafe");
        assert.ok(result.equals(Buffer.from([0xCA, 0xFE])));
    });
});