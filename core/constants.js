module.exports = Object.freeze({
    MSG_HEAD: 0xAA,
    MSG_TAIL: 0xAB,

    SENDER_SENSOR_READING: 0xC0,
    SENDER_SENSOR_CONFIG: 0xC5,
    SENDER_PC: 0xB4,

    CMD_PMU_POWER: 0x06,
    CMD_PMU_MODE: 0x02,
    CMD_QUERY: 0x04,
    CMD_FIRMWARE: 0x07,
    CMD_PERIOD: 0x08,

    MODE_GET: 0x0,
    MODE_SET: 0x1,
    MODE_FF: 0xFF
});