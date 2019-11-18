const fs = require('fs');
const path = require('path');
const {getProcessPageAndSerialize} = require('@applitools/dom-snapshot');
const puppeteer = require('puppeteer');
const browserLog = require('../src/browserLog');

const url = process.argv[2];
const outFilepath = path.resolve(__dirname, '../logs/dom.json');

async function main() {
  const processPageAndSerialize = await getProcessPageAndSerialize();
  const browser = await puppeteer.launch(); // {headless: false}
  const page = await browser.newPage();
  browserLog({
    page,
    onLog: text => {
      if (text.match(/\[dom-snapshot\]/)) {
        console.log(text);
      }
    },
  });
  await page.goto(url);
  await new Promise(r => setTimeout(r, 4000));
  const start = Date.now();
  console.log('running processPage...');
  const dom = await page.evaluate(`(${processPageAndSerialize})(document, {showLogs: true})`);
  console.log('done processPage:', Date.now() - start);
  fs.writeFileSync(outFilepath, JSON.stringify(dom, null, 2));

  console.log(Object.keys(dom));
  console.log('total:\t', toMB(JSON.stringify(dom).length));
  console.log('cdt:\t', toMB(JSON.stringify(dom.cdt).length));
  console.log('frames:\t', toMB(JSON.stringify(dom.frames).length));
  console.log(`blobs (${dom.blobs.length}):\t`, toMB(JSON.stringify(dom.blobs).length));
  console.log(
    '  ' +
      dom.blobs
        .sort((a, b) => (a.value.length < b.value.length ? 1 : -1))
        .map(({url, value}) => `${url.substr(-32)} ==> ${toMB(value.length)}`)
        .join('\n  '),
  );

  await browser.close();
}

function toMB(size) {
  return Math.round((size / 1024 / 1024) * 100) / 100 + ' MB';
}

main().catch(err => {
  console.log(err);
  process.exit(1);
});
