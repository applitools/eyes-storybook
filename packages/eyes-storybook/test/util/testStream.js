'use strict';

const {PassThrough} = require('stream');
const stripAnsi = require('strip-ansi');

function testStream() {
  const events = [];
  const noop = () => {};
  const stream = new PassThrough();
  stream.clearLine = noop;
  stream.cursorTo = noop;
  stream.moveCursor = noop;
  stream.on('data', data => {
    events.push(stripAnsi(data.toString()));
  });
  return {
    stream,
    getEvents() {
      return events;
    },
  };
}

module.exports = testStream;
