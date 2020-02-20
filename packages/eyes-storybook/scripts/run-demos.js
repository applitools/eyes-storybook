const {createWriteStream, writeFileSync: _writeFileSync} = require('fs');
const path = require('path');
const {promisify: _p} = require('util');
const {spawn} = require('child_process');
const ts = Date.now();

function runDemo({name, href}) {
  return new Promise(resolve => {
    const start = Date.now();
    console.log('running', name);
    const proc = spawn('node', ['bin/eyes-storybook.js', '-u', href], {
      stdio: 'pipe',
      env: Object.assign(
        {
          APPLITOOLS_APP_NAME: name,
          APPLITOOLS_BATCH_ID: `batch_${ts}`,
        },
        process.env,
      ),
    });
    const filepath = path.resolve(__dirname, 'output', name);
    const stream = createWriteStream(filepath);
    proc.stdout.pipe(stream);
    proc.stderr.pipe(stream);
    proc.on('exit', () => {
      console.log('finished', name, `(${Date.now() - start})`);
      resolve();
    });
  });
}

(async function() {
  const demos = require('./demos.json');

  for (const demo of demos) {
    try {
      await runDemo(demo);
    } catch (ex) {
      console.log('exception while running demo:', demo.name, ex);
    }
  }

  console.log('done!');
})();
