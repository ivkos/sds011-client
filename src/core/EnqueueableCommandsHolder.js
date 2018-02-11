const SensorCommand = require("../util/SensorCommand");
const CommandBuilder = require("./CommandBuilder");
const SensorReading = require('../util/SensorReading');

class EnqueueableCommandsHolder
{
    constructor(commandProcessor, state) {
        this._commandProcessor = commandProcessor;
        this._state = state;
    }

    enqueueQueryCommand(port, state) {
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

    enqueueSetModeCommand(port, state, mode) {
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

    enqueueGetModeCommand(port, state) {
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

    enqueueSetSleepCommand(port, state, shouldSleep) {
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

    enqueueGetVersionCommand(port, state) {
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

    enqueueSetWorkingPeriodCommand(port, state, time) {
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

    enqueueGetWorkingPeriodCommand(port, state) {
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
}

module.exports = EnqueueableCommandsHolder;