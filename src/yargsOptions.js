module.exports = {
  conf: {
    alias: 'f',
    description: 'Path to applitools.config.js config file',
    requiresArg: true,
    string: true,
  },

  storybookUrl: {
    alias: ['u', 'storybook-url'],
    description: 'URL to storybook',
    requiresArg: true,
    string: true,
  },

  // storybook options
  startServer: {
    alias: ['s', 'start-server'],
    description: 'Whether to run a storybook dev server',
    requiresArg: false,
    boolean: true,
  },
  storybookPort: {
    alias: ['p', 'storybook-port'],
    description: 'Port to run Storybook',
    requiresArg: false,
    number: true,
  },
  storybookHost: {
    alias: ['h', 'storybook-host'],
    description: 'Host to run Storybook',
    requiresArg: false,
    string: true,
  },

  // general
  exitcode: {
    alias: 'e',
    description: 'If tests failed close with non-zero exit code',
    requiresArg: false,
    boolean: true,
  },
};
