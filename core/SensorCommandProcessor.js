const SensorCommand = require('./SensorCommand');

const ALLOWED_RETRIES = 10; // Number of retries allowed for single command request.
const COMMAND_RETRY_INTERVAL = 150; // Time between sequential retries.

class SensorCommandProcessor
{
    constructor() {
        this._queue = [];
        this._isCurrentlyProcessing = false;
        this._retryCount = 0;
    }

    enqueue(command) {
        if (command.constructor.name !== SensorCommand.name)
            throw new Error(`Argument of type "${SensorCommand.name}" is required.`);

        this._queue.push(command);

        if (!this._isCurrentlyProcessing) {
            this._processCommands();
        }
    }

    clear() {
        this._queue.length = 0;
    }

    _processCommands() {
        this._isCurrentlyProcessing = true;
        const cmd = this._queue[0];

        // Run prepare command for the first execution of new command
        if (this._retryCount === 0 && cmd !== undefined)
            cmd.prepare();

        // Reject command if it failed after defined number of retries
        if (++this._retryCount > ALLOWED_RETRIES) {
            const faultyCommand = this._queue.shift();

            faultyCommand.failureCallback(new Error("Command failed")); // Let the world know
            this._retryCount = 0;

            this._processCommands(); // Move to the next command
            return;
        }

        if (this._queue.length > 0) {
            if (cmd.isFulfilled()) {
                this._queue.shift(); // Fully processed, remove from the queue.
                this._retryCount = 0;

                cmd.successCallback();

                this._processCommands(); // Move to the next command
            } else {
                // Command completion condition was not met. Run command and run check after some time.

                cmd.execute();
                setTimeout(this._processCommands.bind(this), COMMAND_RETRY_INTERVAL);
            }
        } else {
            // Processed all pending commands.
            this._isCurrentlyProcessing = false;
            this._retryCount = 0;
        }
    }
}

module.exports = SensorCommandProcessor;