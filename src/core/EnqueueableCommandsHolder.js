const SensorCommand = require("../util/SensorCommand");
const CommandBuilder = require("./CommandBuilder");
const SensorReading = require('../util/SensorReading');

class EnqueueableCommandsHolder
{
    constructor(commandProcessor, state, port) {
        this._commandProcessor = commandProcessor;
        this._state = state;
        this._port = port;
    }

    enqueueQueryCommand() {
        function prepare() {
            this.state.pm2p5 = undefined;
            this.state.pm10 = undefined;
        }

        function execute() {
            this.port.write(CommandBuilder.query());
        }

        function isFulfilled() {
            return (this.state.pm2p5 !== undefined) && (this.state.pm10 !== undefined);
        }

        return new Promise((resolve, reject) => {
            function resolveWithReadings() {
                resolve(new SensorReading(this.state.pm2p5, this.state.pm10));
            }

            this._commandProcessor.enqueue(new SensorCommand(
                this._port,
                resolveWithReadings.bind(this._createContext()),
                reject,
                prepare.bind(this._createContext()),
                execute.bind(this._createExecuteContext()),
                isFulfilled.bind(this._createContext())
            ));
        });
    }

    enqueueSetModeCommand(mode) {
        if (mode !== 'active' && mode !== 'query')
            throw new Error('Invalid mode');

        function prepare() {
            this.state.mode = undefined;
        }

        function execute() {
            this.port.write(CommandBuilder.setReportingMode(mode === 'active'));
        }

        function isFulfilled() {
            return this.state.mode === this.setMode;
        }

        return new Promise((resolve, reject) => {
            this._commandProcessor.enqueue(new SensorCommand(
                this._port,
                resolve,
                reject,
                prepare.bind(this._createContext()),
                execute.bind(this._createExecuteContext({ mode: mode })),
                isFulfilled.bind(this._createContext({ setMode: mode }))
            ));
        });
    }

    enqueueGetModeCommand() {
        function prepare() {
            this.state.mode = undefined;
        }

        function execute() {
            this.port.write(CommandBuilder.getReportingMode());
        }

        function isFulfilled() {
            return this.state.mode !== undefined;
        }

        return new Promise((resolve, reject) => {
            function resolveWithMode() {
                resolve(this.state.mode);
            }

            this._commandProcessor.enqueue(new SensorCommand(
                this._port,
                resolveWithMode.bind(this._createContext()),
                reject,
                prepare.bind(this._createContext()),
                execute.bind(this._createExecuteContext()),
                isFulfilled.bind(this._createContext())
            ));
        });
    }

    enqueueSetSleepCommand(port, state, shouldSleep) {
        function prepare() {
            this.state.isSleeping = undefined;
        }

        function execute() {
            this.port.write(CommandBuilder.setPower(!shouldSleep));
        }

        function isFulfilled() {
            return this.state.isSleeping === this.shouldSleep;
        }

        return new Promise((resolve, reject) => {
            this._commandProcessor.enqueue(new SensorCommand(
                this._port,
                resolve,
                reject,
                prepare.bind(this._createContext()),
                execute.bind(this._createExecuteContext({ shouldSleep: shouldSleep })),
                isFulfilled.bind(this._createContext({ shouldSleep: shouldSleep }))
            ));
        });
    }

    enqueueGetVersionCommand() {
        function prepare() {
            this.state.firmware = undefined;
        }

        function execute() {
            this.port.write(CommandBuilder.getFirmware());
        }

        function isFulfilled() {
            return this.state.firmware !== undefined;
        }

        return new Promise((resolve, reject) => {
            function resolveWithFirmwareVersion() {
                resolve(this.state.firmware);
            }

            this._commandProcessor.enqueue(new SensorCommand(
                this._port,
                resolveWithFirmwareVersion.bind(this._createContext()),
                reject,
                prepare.bind(this._createContext()),
                execute.bind(this._createExecuteContext()),
                isFulfilled.bind(this._createContext())
            ));
        });
    }

    enqueueSetWorkingPeriodCommand(port, state, time) {
        function prepare() {
            this.state.workingPeriod = undefined;
        }

        function execute() {
            this.port.write(CommandBuilder.setPeriod(time));
        }

        function isFulfilled() {
            return this.state.workingPeriod === this.setPeriod;
        }

        return new Promise((resolve, reject) => {
            this._commandProcessor.enqueue(new SensorCommand(
                this._port,
                resolve,
                reject,
                prepare.bind(this._createContext()),
                execute.bind(this._createExecuteContext({ time: time })),
                isFulfilled.bind(this._createContext({ setPeriod: time }))
            ));
        });
    }

    enqueueGetWorkingPeriodCommand() {
        function prepare() {
            this.state.workingPeriod = undefined;
        }

        function execute() {
            this.port.write(CommandBuilder.getPeriod());
        }

        function isFulfilled() {
            return this.state.workingPeriod !== undefined;
        }

        return new Promise((resolve, reject) => {
            function resolveWithTime() {
                resolve(this.state.workingPeriod);
            }

            this._commandProcessor.enqueue(new SensorCommand(
                this._port,
                resolveWithTime.bind(this._createContext()),
                reject,
                prepare.bind(this._createContext()),
                execute.bind(this._createExecuteContext()),
                isFulfilled.bind(this._createContext())
            ));
        });
    }

    _createContext(also) {
        return Object.assign({}, { state: this._state }, also);
    }

    _createExecuteContext(also) {
        return Object.assign({}, { port: this._port }, also);
    }
}

module.exports = EnqueueableCommandsHolder;