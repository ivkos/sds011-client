const SerialPort = require('serialport');
const EventEmitter = require('events');
const SensorState = require("./SensorState.js");
const SensorCommand = require("./SensorCommand.js");
const MessageHandlerUtils = require("./MessageHandlerUtils.js");
const CommandBuilder = require("./CommandBuilder");
const Constants = require("./Constants");
const SerialDataHandler = require('./SerialDataHandler');
const SensorReading = require('./SensorReading');
const SensorCommandProcessor = require('./SensorCommandProcessor');

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

        this._port
            .on(Constants.EVENT_ERROR, err => this.emit(Constants.EVENT_ERROR, err))
            .on('data', buf => this.emit(Constants.EVENT_SERIAL_DATA, buf))
            .on('data', buf => this._serialDataHandler.push(buf));

        this._serialDataHandler
            .on(Constants.EVENT_MESSAGE, buf => this.emit(Constants.EVENT_MESSAGE, buf))
            .on(Constants.EVENT_MESSAGE, buf => this._handleMessage(buf))
            .on(Constants.EVENT_MESSAGE_ERROR, err => this.emit(Constants.EVENT_MESSAGE_ERROR, err));

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
        return this._enqueueQueryCommand(this._port, this._state);
    }

    _enqueueQueryCommand(port, state) {
        function prepare() {
            this.state.pm2p5 = undefined;
            this.state.pm10 = undefined;
        }

        const prepareContext = {
            state: state
        };

        function execute() {
            this.port.write(CommandBuilder.query());
        }

        const executeContext = {
            port: port
        };

        function isFulfilled() {
            return (this.state.pm2p5 !== undefined) && (this.state.pm10 !== undefined);
        }

        const isFulfilledContext = {
            state: state
        };

        return new Promise((resolve, reject) => {
            function resolveWithReadings() {
                resolve(new SensorReading(this.state.pm2p5, this.state.pm10));
            }

            const resolveContext = {
                state: state
            };

            this._commandProcessor.enqueue(new SensorCommand(
                port,
                resolveWithReadings.bind(resolveContext),
                reject,
                prepare.bind(prepareContext),
                execute.bind(executeContext),
                isFulfilled.bind(isFulfilledContext)
            ));
        });
    }

    /**
     * Set reporting mode. This setting is still effective after power off.
     *
     * @param {('active'|'query')} mode - active: data will be emitted as "data" event, query: new data has to requested manually @see query
     *
     * @returns {Promise} Resolved when mode was set successfully. May be rejected if sensor fails to respond after a number of internal retries.
     */
    setReportingMode(mode) {
        return this._enqueueSetModeCommand(this._port, this._state, mode);
    }

    _enqueueSetModeCommand(port, state, mode) {
        if (mode !== 'active' && mode !== 'query')
            throw new Error('Invalid mode');

        function prepare() {
            this.state.mode = undefined;
        }

        const prepareContext = {
            state: state
        };

        function execute() {
            this.port.write(CommandBuilder.setReportingMode(mode === 'active'));
        }

        const executeContext = {
            port: port,
            mode: mode
        };

        function isFulfilled() {
            return this.state.mode === this.setMode;
        }

        const isFulfilledContext = {
            state: this._state,
            setMode: mode
        };

        return new Promise((resolve, reject) => {
            this._commandProcessor.enqueue(new SensorCommand(
                port,
                resolve,
                reject,
                prepare.bind(prepareContext),
                execute.bind(executeContext),
                isFulfilled.bind(isFulfilledContext)
            ));
        });
    }

    /**
     * Get reporting mode.
     *
     * @returns {Promise} Resolved with either 'active' or 'query'. May be rejected if sensor fails to respond after a number of internal retries.
     */
    getReportingMode() {
        return this._enqueueGetModeCommand(this._port, this._state);
    }

    _enqueueGetModeCommand(port, state) {
        function prepare() {
            this.state.mode = undefined;
        }

        const prepareContext = {
            state: state
        };

        function execute() {
            this.port.write(CommandBuilder.getReportingMode());
        }

        const executeContext = {
            port: port
        };

        function isFulfilled() {
            return this.state.mode !== undefined;
        }

        const isFulfilledContext = {
            state: this._state
        };

        return new Promise((resolve, reject) => {
            function resolveWithMode() {
                resolve(this.state.mode);
            }

            const resolveContext = {
                state: state
            };

            this._commandProcessor.enqueue(new SensorCommand(
                port,
                resolveWithMode.bind(resolveContext),
                reject,
                prepare.bind(prepareContext),
                execute.bind(executeContext),
                isFulfilled.bind(isFulfilledContext)
            ));
        });
    }

    /**
     * Switch to sleep mode and back. Fan and laser will be turned off while in sleep mode. Any command will wake the device.
     *
     * @param {boolean} shouldSleep - whether device should sleep or not
     *
     * @returns {Promise} Resolved when operation completed successfully. May be rejected if sensor fails to respond after a number of internal retries.
     */
    setSleepSetting(shouldSleep) {
        return this._enqueueSetSleepCommand(this._port, this._state, shouldSleep);
    }

    _enqueueSetSleepCommand(port, state, shouldSleep) {
        function prepare() {
            this.state.isSleeping = undefined;
        }

        const prepareContext = {
            state: state
        };

        function execute() {
            this.port.write(CommandBuilder.setPower(!shouldSleep));
        }

        const executeContext = {
            port: port,
            shouldSleep: shouldSleep
        };

        function isFulfilled() {
            return this.state.isSleeping === this.shouldSleep;
        }

        const isFulfilledContext = {
            state: this._state,
            shouldSleep: shouldSleep
        };

        return new Promise((resolve, reject) => {
            this._commandProcessor.enqueue(new SensorCommand(
                port,
                resolve,
                reject,
                prepare.bind(prepareContext),
                execute.bind(executeContext),
                isFulfilled.bind(isFulfilledContext)
            ));
        });
    }

    /**
     * Read software version. It will be presented in "year-month-day" format.
     *
     * @returns {Promise<string>} - Resolved with sensor firmware version. May be rejected if sensor fails to respond after a number of internal retries.
     */
    getVersion() {
        return this._enqueueGetVersionCommand(this._port, this._state);
    }

    _enqueueGetVersionCommand(port, state) {
        function prepare() {
            this.state.firmware = undefined;
        }

        const prepareContext = {
            state: state
        };

        function execute() {
            this.port.write(CommandBuilder.getFirmware());
        }

        const executeContext = {
            port: port
        };

        function isFulfilled() {
            return this.state.firmware !== undefined;
        }

        const isFulfilledContext = {
            state: this._state
        };

        return new Promise((resolve, reject) => {
            function resolveWithFirmwareVersion() {
                resolve(this.state.firmware);
            }

            const resolveContext = {
                state: state
            };

            this._commandProcessor.enqueue(new SensorCommand(
                port,
                resolveWithFirmwareVersion.bind(resolveContext),
                reject,
                prepare.bind(prepareContext),
                execute.bind(executeContext),
                isFulfilled.bind(isFulfilledContext)
            ));
        });
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

        return this._enqueueSetWorkingPeriodCommand(this._port, this._state, time);
    }

    _enqueueSetWorkingPeriodCommand(port, state, time) {
        function prepare() {
            this.state.workingPeriod = undefined;
        }

        const prepareContext = {
            state: state
        };

        function execute() {
            this.port.write(CommandBuilder.setPeriod(time));
        }

        const executeContext = {
            port: port,
            time: time
        };

        function isFulfilled() {
            return this.state.workingPeriod === this.setPeriod;
        }

        const isFulfilledContext = {
            state: this._state,
            setPeriod: time
        };

        return new Promise((resolve, reject) => {
            this._commandProcessor.enqueue(new SensorCommand(
                port,
                resolve,
                reject,
                prepare.bind(prepareContext),
                execute.bind(executeContext),
                isFulfilled.bind(isFulfilledContext)
            ));
        });
    }

    /**
     * Get current working period.
     *
     * @returns {Promise<Number>} Resolved with current period setting. May be rejected if sensor fails to respond after a number of internal retries.
     */
    getWorkingPeriod() {
        return this._enqueueGetWorkingPeriodCommand(this._port, this._state);
    }

    _enqueueGetWorkingPeriodCommand(port, state) {
        function prepare() {
            this.state.workingPeriod = undefined;
        }

        const prepareContext = {
            state: state
        };

        function execute() {
            this.port.write(CommandBuilder.getPeriod());
        }

        const executeContext = {
            port: port
        };

        function isFulfilled() {
            return this.state.workingPeriod !== undefined;
        }

        const isFulfilledContext = {
            state: this._state
        };

        return new Promise((resolve, reject) => {
            function resolveWithTime() {
                resolve(this.state.workingPeriod);
            }

            const resolveContext = {
                state: state
            };

            this._commandProcessor.enqueue(new SensorCommand(
                port,
                resolveWithTime.bind(resolveContext),
                reject,
                prepare.bind(prepareContext),
                execute.bind(executeContext),
                isFulfilled.bind(isFulfilledContext)
            ));
        });
    }

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
}

module.exports = SDS011Client;