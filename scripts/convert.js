'use strict';

const fs = require('fs');

function convert(logStr) {
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
  return {lines};
}

if (require.main === module) {
  const s = fs.readFileSync(process.argv[2]);
  const {lines} = convert(s);
  fs.writeFileSync(`${process.argv[2].replace('.log', '.converted.log')}`, lines.join('\n'));
  console.log(`converted ${lines.length} lines`);
}

module.exports = convert;
