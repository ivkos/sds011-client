/**
 * Internal state of the sensor.
 *
 * @ignore
 */
class SensorState
{
    constructor() {
        this.workingPeriod = undefined;
        this.mode = undefined;
        this.isSleeping = undefined;
        this.firmware = undefined;
        this.pm2p5 = undefined;
        this.pm10 = undefined;
        this.closed = false;
    }
}

module.exports = SensorState;