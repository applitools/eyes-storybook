'use strict';

const fakeEyesServer = require('../test/util/fakeEyesServer');

(async () => {
  const {port} = await fakeEyesServer({port: process.env.PORT || 0, hangUp: true});
  console.log(`http://localhost:${port}`);
})().catch(err => {
  console.log('err', err);
  process.exit(1);
});
