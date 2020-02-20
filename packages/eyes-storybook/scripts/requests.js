'use strict';

const fs = require('fs');
const filepath = process.argv[2];
const s = fs.readFileSync(filepath).toString();
const lines = s.toString().split('\n');
const requests = getRequests(lines);

const outFilepath = filepath.replace('.log', '') + '.requests.json';
fs.writeFileSync(outFilepath, JSON.stringify(requests));
console.log(`wrote ${Object.keys(requests).length} stories to ${outFilepath}`);

const byMethod = Object.keys(requests).reduce((acc, requestId) => {
  const req = requests[requestId];
  acc[req.method] = acc[req.method] || [];
  acc[req.method].push(req);
  return acc;
}, {});

const stats = Object.keys(byMethod).reduce((acc, method) => {
  const data = byMethod[method];
  const hanging = data.filter(({error}) => error === 'hanging');
  const notHanging = data.filter(({error}) => error !== 'hanging');
  const totals = notHanging.map(({total}) => total);
  const errors = notHanging.filter(({error}) => error).map(({error}) => error);
  acc[method] = acc[method] || {};
  acc[method].avg = Number(
    Number(totals.reduce((sum, x) => sum + x, 0) / totals.length).toFixed(2),
  );
  acc[method].max = Math.max(...totals);
  acc[method].median = totals.sort((a, b) => (a > b ? -1 : 1))[Math.floor(totals.length / 2)];
  acc[method].count = totals.length;
  acc[method].errors = `${errors.length} (${Number((errors.length / data.length) * 100).toFixed(
    2,
  )}%)`;
  acc[method].hanging = hanging.length;
  acc[method].maxSuccess = Math.max(...data.filter(({error}) => !error).map(({total}) => total));
  return acc;
}, {});

console.log(
  Object.keys(stats)
    .map(method => {
      const paramStrs = Object.keys(stats[method]).map(
        param => `${pad(param, 5)}: ${pad(stats[method][param], 6)}`,
      );
      return `${pad(method, 18)}: ${paramStrs.join(' | ')}`;
    })
    .join('\n'),
);

function pad(str, len) {
  return `${str}${new Array(Math.max(0, len - String(str).length)).fill(' ').join('')}`;
}

function getRequests(lines) {
  const data = {};
  const reTime = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z/;
  const reStart = /\(\)\: ServerConnector\.(.+) \[(.+)\] will now call to/;
  const reEndSuccess = /\(\)\: ServerConnector\.(.+) \[(.+)\] - result OK/;
  const reEndFail = /\(\)\: ServerConnector\.(.+) \[(.+)\] - (.+) failed on https\:\/\/[^\s]+\: (.+) (with params):?/;
  let lastTime;
  lines.forEach(line => {
    const timeMatch = line.match(reTime);
    const time = timeMatch && timeMatch[0];
    if (time) lastTime = time;
    let match;
    if ((match = line.match(reStart))) {
      const method = match[1];
      const requestId = match[2];
      data[requestId] = {start: time, method};
    } else if ((match = line.match(reEndSuccess))) {
      const requestId = match[2];
      data[requestId].end = time;
      data[requestId].total = (new Date(time) - new Date(data[requestId].start)) / 1000;
    } else if ((match = line.match(reEndFail))) {
      const requestId = match[2];
      const error = match[4];
      data[requestId].end = time;
      data[requestId].error = error;
      data[requestId].total = (new Date(time) - new Date(data[requestId].start)) / 1000;
    }
  });

  Object.keys(data).forEach(requestId => {
    if (data[requestId].total === undefined) {
      data[requestId].error = 'hanging';
      data[requestId].total = (new Date(lastTime) - new Date(data[requestId].start)) / 1000;
    }
  });

  return data;
}
