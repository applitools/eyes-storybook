'use strict';
const {spawn} = require('child_process');
const EventEmitter = require('events');

class StorybookConnector extends EventEmitter {
  constructor({
    storybookPath,
    storybookPort,
    storybookHost,
    storybookConfigDir,
    storybookStaticDir,
    isWindows,
    logger,
  }) {
    super();
    this._storybookPath = `${storybookPath}${isWindows ? '.cmd' : ''}`;
    this._storybookPort = storybookPort;
    this._storybookHost = storybookHost;
    this._storybookConfigDir = storybookConfigDir;
    this._storybookStaticDir = storybookStaticDir;
    this._isWindows = isWindows;
    this._logger = logger;

    this._childProcess = null;
    this._version = 5;

    this._onStderr = data => {
      this.emit('stderr', this._bufferToString(data));
    };
    this._onStdout = data => {
      this.emit('stdout', this._bufferToString(data));
    };
  }

  async start(timeout) {
    this._doSpawan(this._version);
    return this._wait(timeout);
  }

  async kill() {
    if (!this._childProcess) {
      return;
    }
    try {
      if (this._isWindows) {
        spawn('taskkill', ['/pid', this._childProcess.pid, '/f', '/t']);
      } else {
        process.kill(-this._childProcess.pid);
      }
    } catch (e) {
      this._logger.log("Can't kill child (Storybook) process.", e);
    }
  }

  async _wait(timeout) {
    return new Promise((resolve, reject) => {
      const removeListeners = () => {
        this.removeListener('stdout', successMessageListener);
        this.removeListener('stderr', portBusyListener);
        this.removeListener('stderr', successMessageListener);
      };

      const portBusyListener = str => {
        if (str.includes('Error: listen EADDRINUSE')) {
          clearTimeout(timeoutID);
          removeListeners();
          this.on('stderr', portBusyListener);
          reject(new Error('Storybook port already in use'));
        }
      };

      const successMessageListener = str => {
        const isReady = str.match(
          /Storybook \d{1,2}\.\d{1,2}\.\d{1,2}(-.+)? started|Storybook started on =>/,
        );
        if (isReady) {
          clearTimeout(timeoutID);
          removeListeners();
          resolve();
        }
      };

      this.on('stdout', successMessageListener);
      this.on('stderr', portBusyListener);
      this.on('stderr', successMessageListener);

      const minutes = timeout / 1000 / 60;
      const timeoutID = setTimeout(
        reject,
        timeout,
        `Storybook din't start after ${minutes} min waiting.`,
      );
    });
  }

  _doSpawan(version) {
    const args = [
      '-p',
      this._storybookPort,
      '-h',
      this._storybookHost,
      '-c',
      this._storybookConfigDir,
    ];
    if (this._storybookStaticDir) {
      args.push('-s');
      args.push(this._storybookStaticDir);
    }
    if (version >= 4) {
      args.push('--ci');
    }
    this._logger.log(`${this._storybookPath} ${args.join(' ')}`);
    this._childProcess = spawn(this._storybookPath, args, {detached: !this._isWindows});
    this._addListeners();

    this._childProcess.once('exit', code => {
      if (!code) return;
      this._removeListeners();
      this._childProcess = null;
      if (this._version === 5) {
        this._logger.log('failed to start storybook, retrying lower version.');
        this._version = 3;
        this._doSpawan(this._version);
      } else {
        this._logger.log('failed to start storybook.');
        this.emit('failure');
      }
    });
  }

  _bufferToString(data) {
    return data.toString('utf8').trim();
  }

  _removeListeners() {
    this._childProcess.stdout.removeListener('data', this._onStdout);
    this._childProcess.stderr.removeListener('data', this._onStderr);
  }

  _addListeners() {
    this._childProcess.stdout.on('data', this._onStdout);
    this._childProcess.stderr.on('data', this._onStderr);
  }
}

module.exports = StorybookConnector;
