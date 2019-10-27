function convertTimeline(logLines) {
  const reGettingData = /\(\):.+ms\. getting data from story (.+)/;
  const reStart = /running story (.+)$/;
  const reEnd = /finished story (.+) in .+$/;
  const reRenderId = /render request complete for (.+). test=(.+) stepCount/;
  const reScreenshotAvailable = /screenshot available for (.+) at /;
  const reCheckWindow = /running wrapper.checkWindow for test (.+) stepCount/;
  const reStartRender = /starting to render test (.+)/;
  const reTimestamp = /\[\+(\d+)s\]/;
  const timing = {};
  const storiesByRenderId = {};

  logLines.forEach(line => {
    const matchTime = line.match(reTimestamp);
    if (matchTime) {
      const ts = matchTime[1];
      const matchStart = line.match(reStart);
      const matchEnd = line.match(reEnd);
      const matchGettingData = line.match(reGettingData);
      const matchRenderId = line.match(reRenderId);
      const matchScreenshotAvailable = line.match(reScreenshotAvailable);
      const matchCheckWindow = line.match(reCheckWindow);
      const matchStartRender = line.match(reStartRender);

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
      } else if (matchRenderId) {
        const storyName = matchRenderId[2];
        const renderId = matchRenderId[1];
        const story = timing[storyName];
        storiesByRenderId[renderId] = story;
        story.renderId = renderId;
      } else if (matchScreenshotAvailable) {
        const renderId = matchScreenshotAvailable[1];
        const story = storiesByRenderId[renderId];
        story.screenshotAvailable = ts;
      } else if (matchCheckWindow) {
        const storyName = matchCheckWindow[1];
        timing[storyName].checkWindowStart = ts;
      } else if (matchStartRender) {
        const storyName = matchStartRender[1];
        timing[storyName].startRender = ts;
      }
    } else {
      // console.log('no timestamp found for line', line)
    }
  });

  return timing;
}

function convertLog(logStr) {
  const reTime = /^(\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z)(.+)$/;
  const lines = logStr.toString().split('\n');
  let firstDate;

  lines.forEach((line, i) => {
    const match = line.match(reTime);
    const date = match && match[1];

    if (date) {
      let rest = match[2];
      const d = new Date(date);
      if (!firstDate) {
        firstDate = d.getTime();
      }
      const timeDiff = (d.getTime() - firstDate) / 1000;
      lines[i] = `[+${timeDiff}s]${rest}`;
    }
  });
  return lines;
}

if (require.main === module) {
  const fs = require('fs');
  const filepath = process.argv[2];
  const s = fs.readFileSync(filepath).toString();
  const lines = convertLog(s);
  const timing = convertTimeline(lines);

  const outFilepath = filepath.replace('.log', '') + '.timing.json';
  fs.writeFileSync(outFilepath, JSON.stringify(timing));
  console.log(`wrote ${Object.keys(timing).length} stories to ${outFilepath}`);
}
