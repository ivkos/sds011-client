const EventEmitter = require('events');
const Constants = require("./constants");
const PacketUtils = require("./packet-utils");

class SerialMessageHandler extends EventEmitter
{
    constructor() {
        super();
        this._buf = Buffer.allocUnsafe(0);
    }

    push(buf) {
        this._buf = Buffer.concat([this._buf, buf]);

        while (this._buf.length >= 10) {
            const start = this._buf.indexOf(Constants.MSG_HEAD);

            if (start === -1) {
                this._trimBufLeft(this._buf.length);
                continue;
            }

            if (start > 0) {
                this._trimBufLeft(start);
                continue;
            }

            const end = this._buf.indexOf(Constants.MSG_TAIL, start + 9);

            if (end === -1) {
                this._trimBufLeft(10);
                continue;
            }

            if (end - start !== 9) {
                this._trimBufLeft(start + 10);
                continue;
            }

            const msgBuf = Buffer.allocUnsafe(end - start + 1);
            this._buf.copy(msgBuf, 0, start, end + 1);
            this._trimBufLeft(10 + start);

            if (!PacketUtils.verifyPacket(msgBuf)) {
                const err = new Error("Received invalid packet");
                err.buf = msgBuf;

                this.emit('packet_error', err);

                continue;
            }

            this.emit('message', msgBuf);
        }
    }

    _trimBufLeft(len) {
        if (len <= 0) return;

        if (len >= this._buf.length) {
            this._buf = Buffer.allocUnsafe(0);
            return;
        }

        const newBuf = Buffer.allocUnsafe(this._buf.length - len);
        this._buf.copy(newBuf, 0, len);
        this._buf = newBuf;
    }
}

module.exports = SerialMessageHandler;