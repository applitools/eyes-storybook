'use strict';

const fs = require('fs');
const convert = require('./convert');

function createTiming(logStr) {
  const {lines} = convert(logStr);
  // const lines = logStr.split('\n');

  const reGettingData = /\(\):.+getting data from story (.+)/;
  const reStart = /running story (.+)$/;
  const reEnd = /finished story (.+) in .+$/;
  const reTimestamp = /\[\+(\d+)s\]/;
  const reRenderComplete = /render request complete for (.+)\. test=(.+) stepCount/;
  const reScreenshotAvailable = /screenshot available for (.+) at http/;
  const timing = {};

  lines.forEach(line => {
    const matchTime = line.match(reTimestamp);
    if (matchTime) {
      const ts = matchTime[1];
      const matchStart = line.match(reStart);
      const matchEnd = line.match(reEnd);
      const matchGettingData = line.match(reGettingData);
      const matchRenderComplete = line.match(reRenderComplete);
      const matchScreenshotAvailable = line.match(reScreenshotAvailable);

      if (matchStart) {
        const storyName = matchStart[1];
        if (!timing[storyName]) console.log('@@', storyName);
        timing[storyName].start = ts;
      } else if (matchEnd) {
        const storyName = matchEnd[1];
        timing[storyName].end = ts;
      } else if (matchGettingData) {
        const storyName = matchGettingData[1];
        timing[storyName] = {gettingData: ts};
      } else if (matchRenderComplete) {
        const storyName = matchRenderComplete[2];
        timing[storyName].renderId = matchRenderComplete[1];
      } else if (matchScreenshotAvailable) {
        const renderId = matchScreenshotAvailable[1];
        const story = Object.keys(timing).find(name => timing[name].renderId === renderId);
        if (!story) {
          console.log('missing render:', renderId);
        }
        if (!timing[story]) {
          console.log('missing:', story);
          return;
        }
        timing[story].screenshotAvailable = ts;
      }
    } else {
      // console.log('no timestamp found for line', line)
    }
  });

  return {timing, lines};
}

if (require.main === module) {
  const filepath = process.argv[2];
  const outFilepath = filepath + '.timing.json';
  const convertedFilepath = filepath.replace('.log', '.converted.log');
  const s = fs.readFileSync(filepath).toString();
  const {timing, lines} = createTiming(s);

  fs.writeFileSync(outFilepath, JSON.stringify(timing));
  console.log(`wrote ${Object.keys(timing).length} stories to ${outFilepath}`);

  fs.writeFileSync(`${convertedFilepath}`, lines.join('\n'));
  console.log(`wrote ${lines.length} converted lines to ${convertedFilepath}`);
}
