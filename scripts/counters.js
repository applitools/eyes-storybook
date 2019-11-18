'use strict';
const {convertTimeline, convertLog} = require('./prepare-timline');

function logCounters(lines) {
  lines = convertLog(lines);
  const timing = convertTimeline(lines);
  const data = {
    runningDomSnapshot: 0,
    doneDomSnapshot: 0,
    queuedRenders: 0,
    runningRenders: 0,
    doneRenders: 0,
    queuedTests: 0,
    runningTests: 0,
    doneTests: 0,
  };

  Object.entries(timing).forEach(
    ([
      _storyName,
      {
        start: _start,
        end,
        gettingData: _gettingData,
        doneGettingData,
        renderId: _renderId,
        screenshotAvailable,
        checkWindowStart,
        startRender,
      },
    ]) => {
      if (doneGettingData) {
        data.doneDomSnapshot++;
      } else {
        data.runningDomSnapshot++;
      }

      if (doneGettingData && !startRender) {
        data.queuedRenders++;
      }

      if (startRender && !screenshotAvailable) {
        data.runningRenders++;
      }

      if (screenshotAvailable) {
        data.doneRenders++;
      }

      if (screenshotAvailable && !checkWindowStart) {
        data.queuedTests++;
      }

      if (checkWindowStart && !end) {
        data.runningTests++;
      }

      if (end) {
        data.doneTests++;
      }
    },
  );

  return data;
}

function countersToString({
  runningDomSnapshot,
  doneDomSnapshot,
  queuedRenders,
  runningRenders,
  doneRenders,
  queuedTests,
  runningTests,
  doneTests,
}) {
  return `DOM: ${runningDomSnapshot}/${doneDomSnapshot}, Renders: ${queuedRenders}/${runningRenders}/${doneRenders}, Tests: ${queuedTests}/${runningTests}/${doneTests}`;
}

module.exports = {logCounters, countersToString};

if (require.main === module) {
  const fs = require('fs');
  const filepath = process.argv[2];

  if (process.argv[3] === '--realtime') {
    output();
  } else {
    output(true);
  }

  function output(onetime) {
    const s = fs.readFileSync(filepath).toString();
    const counters = logCounters(s.split('\n'));
    console.log(countersToString(counters));
    if (!onetime) setTimeout(output, 5000);
  }
}
