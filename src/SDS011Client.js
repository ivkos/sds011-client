const SerialPort = require('serialport');
const EventEmitter = require('events');
const SensorState = require("./util/SensorState");
const MessageHandlerUtils = require("./core/MessageHandlerUtils");
const Constants = require("./util/Constants");
const SerialDataHandler = require('./core/SerialDataHandler');
const SensorReading = require('./util/SensorReading');
const SensorCommandProcessor = require('./core/SensorCommandProcessor');
const EnqueueableCommandsHolder = require('./core/EnqueueableCommandsHolder');

class SDS011Client extends EventEmitter
{
    /**
     * Open sensor.
     *
     * @param {string} portPath - Serial port path
     */
    constructor(portPath) {
        super();

        this._port = new SerialPort(portPath, { baudRate: 9600 });
        this._state = new SensorState();
        this._serialDataHandler = new SerialDataHandler();
        this._commandProcessor = new SensorCommandProcessor();
        this._enqueueableCommandsHolder = new EnqueueableCommandsHolder(this._commandProcessor, this._state);

        this._attachListeners();

        // Queue first command to "warm-up" the connection and command queue
        this.query();
    }

    /**
     * Close open connection and cleanup.
     */
    close() {
        if (this._state.closed) {
            console.log('Sensor connection is already closed.');
            return;
        }

        this._port.close();
        this._state.closed = true;
        this._commandProcessor.clear();
        this.removeAllListeners();
    }

    /**
     * Query sensor for it's latest reading.
     *
     * @returns {Promise<object>} Resolved with PM2.5 and PM10 readings. May be rejected if sensor fails to respond after a number of internal retries.
     */
    query() {
        return this._enqueueableCommandsHolder.enqueueQueryCommand(this._port, this._state);
    }


    /**
     * Set reporting mode. This setting is still effective after power off.
     *
     * @param {('active'|'query')} mode - active: data will be emitted as "data" event, query: new data has to requested manually @see query
     *
     * @returns {Promise} Resolved when mode was set successfully. May be rejected if sensor fails to respond after a number of internal retries.
     */
    setReportingMode(mode) {
        return this._enqueueableCommandsHolder.enqueueSetModeCommand(this._port, this._state, mode);
    }

    /**
     * Get reporting mode.
     *
     * @returns {Promise} Resolved with either 'active' or 'query'. May be rejected if sensor fails to respond after a number of internal retries.
     */
    getReportingMode() {
        return this._enqueueableCommandsHolder.enqueueGetModeCommand(this._port, this._state);
    }


    /**
     * Switch to sleep mode and back. Fan and laser will be turned off while in sleep mode. Any command will wake the device.
     *
     * @param {boolean} shouldSleep - whether device should sleep or not
     *
     * @returns {Promise} Resolved when operation completed successfully. May be rejected if sensor fails to respond after a number of internal retries.
     */
    setSleepSetting(shouldSleep) {
        return this._enqueueableCommandsHolder.enqueueSetSleepCommand(this._port, this._state, shouldSleep);
    }


    /**
     * Read software version. It will be presented in "year-month-day" format.
     *
     * @returns {Promise<string>} - Resolved with sensor firmware version. May be rejected if sensor fails to respond after a number of internal retries.
     */
    getVersion() {
        return this._enqueueableCommandsHolder.enqueueGetVersionCommand(this._port, this._state);
    }


    /**
     * Set working period of the sensor. This setting is still effective after power off.
     *
     * @param {number} time - Working time (0 - 30 minutes). Sensor will work continuously when set to 0.
     *
     * @returns {Promise} Resolved when period was changed successfully. May be rejected if sensor fails to respond after a number of internal retries.
     */
    setWorkingPeriod(time) {
        if (time < 0 || time > 30)
            throw new Error('Invalid argument.');

        return this._enqueueableCommandsHolder.enqueueSetWorkingPeriodCommand(this._port, this._state, time);
    }

    /**
     * Get current working period.
     *
     * @returns {Promise<Number>} Resolved with current period setting. May be rejected if sensor fails to respond after a number of internal retries.
     */
    getWorkingPeriod() {
        return this._enqueueableCommandsHolder.enqueueGetWorkingPeriodCommand(this._port, this._state);
    }

    /**
     * @param message
     * @private
     */
    _handleMessage(message) {
        const sender = message[1];
        MessageHandlerUtils.handle(message, this._state);

        if (sender === Constants.SENDER_SENSOR_READING) {
            const isSensibleReading = this._state.pm2p5 > 0 && this._state.pm10 > 0;
            if (isSensibleReading) {
                this.emit(Constants.EVENT_READING, new SensorReading(this._state.pm2p5, this._state.pm10));
            }
        }
    }

    /**
     * @private
     */
    _attachListeners() {
        this._port
            .on(Constants.EVENT_ERROR, err => this.emit(Constants.EVENT_ERROR, err))
            .on('data', buf => this.emit(Constants.EVENT_SERIAL_DATA, buf))
            .on('data', buf => this._serialDataHandler.push(buf));

        this._serialDataHandler
            .on(Constants.EVENT_MESSAGE, buf => this.emit(Constants.EVENT_MESSAGE, buf))
            .on(Constants.EVENT_MESSAGE, buf => this._handleMessage(buf))
            .on(Constants.EVENT_MESSAGE_ERROR, err => this.emit(Constants.EVENT_MESSAGE_ERROR, err));
    }
}

module.exports = SDS011Client;