'use strict';
const fs = require('fs');

async function main() {
  const mem = [];
  let memTimeout;
  takeMemLoop();

  // await fillArrayWithLargeStrings();
  await readLargeFileManyTimes({interval: 0, times: 10000, size: 1024 * 1024 * 1});

  clearTimeout(memTimeout);
  mem.push(process.memoryUsage());
  console.log(mem.map(memoryLog).join('\n'));

  function takeMemLoop() {
    const usage = process.memoryUsage();
    mem.push(usage);
    console.log(memoryLog(usage));
    memTimeout = setTimeout(takeMemLoop, 1000);
  }
}

main().catch(ex => {
  console.log(ex);
  process.exit(1);
});

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// eslint-disable-next-line no-unused-vars
async function readLargeFileManyTimes(
  {times = 180, interval = 300, size = 1024 * 1024 * 10} = {
    times: 180,
    interval: 300,
    size: 1024 * 1024 * 10,
  },
) {
  const filepath = `${__dirname}/large_file`;
  fs.unlinkSync(filepath);
  const buff = allocObjectBuffer(size);
  fs.writeFileSync(filepath, buff);

  for (let i = 0; i < times; i++) {
    await sleep(interval);
    const buff = fs.readFileSync(filepath);
    const str = JSON.stringify(JSON.parse(buff));
    console.log(`${i + 1}. read ${str.length}`);
  }
}

// eslint-disable-next-line no-unused-vars
async function fillArrayWithLargeStrings(
  {length = 20, size = 1024 * 1024 * 100} = {length: 20, size: 1024 * 1024 * 100},
) {
  const arr = new Array(length).fill();
  const result = [];

  const buff = allocObjectBuffer(size);

  for (const _item of arr) {
    await sleep(1000);
    const data = JSON.parse(buff);
    result.push(JSON.stringify(data).length);
  }
}

function allocObjectBuffer(size) {
  const buff = Buffer.alloc(size);
  buff.fill('q');
  buff.write('{"a":"w');
  buff.write('"}', size - 2);
  return buff;
}

function memoryLog(usage) {
  return `Memory usage: ${Object.keys(usage)
    .map(key => `${key}: ${toMB(usage[key])} MB`)
    .join(', ')}`;
}

function toMB(size) {
  return Math.round((size / 1024 / 1024) * 100) / 100;
}
