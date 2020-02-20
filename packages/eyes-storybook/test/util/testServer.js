'use strict';
const {promisify: p} = require('util');
const path = require('path');
const express = require('express');

module.exports = ({port = 0} = {}) => {
  const app = express();
  app.use('/', express.static(path.resolve(__dirname, '../fixtures')));

  return new Promise((resolve, _reject) => {
    const server = app.listen(port, () => {
      const serverPort = server.address().port;
      const close = p(server.close.bind(server));
      // console.log(`server running at port: ${serverPort}`);
      resolve({port: serverPort, close});
    });
  });
};
