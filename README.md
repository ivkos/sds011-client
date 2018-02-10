SDS011 Client for Node.js
=========
[![Build Status](https://travis-ci.org/ivkos/sds011-client.svg?branch=master)](https://travis-ci.org/ivkos/sds011-client)  [![Codecov](https://img.shields.io/codecov/c/github/ivkos/sds011-client.svg)](https://codecov.io/gh/ivkos/sds011-client)


Air quality measurements made easy with client library for SDS011 UART interface.

Save your time and focus on specific IoT solution instead of serial communication.

[![NPM](https://nodei.co/npm/sds011-client.png)](https://npmjs.org/package/sds011-client)

## Watch out!

Nova Fitness SDS011 laser is designed for 8000 hours of continuous use - this is less than one year. It is recommended to configure [working period](https://github.com/ivkos/sds011-client/wiki/API#SDS011Client+setWorkingPeriod) to extend life span of your solution.

## Synopsis

1. Require the module
```js
const SDS011Client = require("sds011-client");
```
2. Connect to your sensor through serial port
```js
const sensor = new SDS011Client("COM5");
```
3. Configure
```js
Promise
    .all([sensor.setReportingMode('active'), sensor.setWorkingPeriod(10)])
    .then(() => {
        // everything's set
    });
```
4. Do awesome things
```js
sensor.on('measure', (data) => {
    if (data['PM2.5'] > 10) {
        powerAirPurifierOn();
    } else {
        powerAirPurifierOff();
    }
});
```

## Installation

  `npm install sds011-client`

## Usage

- Check the 'examples' folder.
- See the [API docs](https://github.com/ivkos/sds011-client/wiki/API)

## Contributors

This project is based on the original work by [Michał Wilski](https://github.com/triforcely) - [SDS011-Wrapper](https://github.com/triforcely/sds011-wrapper).