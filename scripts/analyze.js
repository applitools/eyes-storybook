'use strict';

const fs = require('fs');

function analyze(logStr) {
  const re = /render status job \((\d+)\)/g;

  const matches = [];
  let match;

  while ((match = re.exec(logStr))) {
    matches.push(match[1]);
  }

  const num = matches.map(Number);
  const avgConcurrentRenders = num.reduce((a, b) => a + b, 0) / matches.length;
  const maxConcurrentRenders = num.reduce((a, b) => (a > b ? a : b));

  const perfMatch = logStr.match(/perf results ([^\n]+)\n/);
  let avgStoryTime, maxStoryTime;
  if (perfMatch) {
    const perf = JSON.parse(perfMatch[1]);
    delete perf.renderStories;
    const values = Object.values(perf);
    avgStoryTime = values.reduce((a, b) => a + b, 0) / values.length;
    maxStoryTime = values.reduce((a, b) => (a > b ? a : b));
  }

  const totalMatch = /Total time: (\d+) seconds/.exec(logStr);
  let totalTime;
  if (totalMatch) {
    totalTime = totalMatch[1];
  }

  // TODO better mem parsing
  const memRe = /\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z.+Memory usage.+/g;
  const memMatches = [];
  let memMatch;
  while ((memMatch = memRe.exec(logStr))) {
    memMatches.push(memMatch[0]);
  }

  return {
    avgConcurrentRenders,
    maxConcurrentRenders,
    avgStoryTime,
    maxStoryTime,
    totalTime,
    mem: memMatches,
  };
}

if (require.main === module) {
  const s = fs.readFileSync(process.argv[2]).toString();
  const {
    avgConcurrentRenders,
    maxConcurrentRenders,
    avgStoryTime,
    maxStoryTime,
    totalTime,
    mem,
  } = analyze(s);

  console.log(`
memory                     : \n  ${mem.join('\n  ')}
average concurrent renders : ${avgConcurrentRenders.toFixed(2)}
max concurrent renders     : ${maxConcurrentRenders}
average story time         : ${(avgStoryTime / 1000).toFixed(2)}s
max story time             : ${(maxStoryTime / 1000).toFixed(2)}s
total time                 : ${totalTime}s
`);
}

module.exports = analyze;
