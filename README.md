# Eyes.Storybook

Applitoos Eyes SDK for [Storybook](http://storybook.js.org).

## Installation

### Install npm package

Install Eyes.Storybook as a local dev dependency in your tested project:

```bash
npm install --save-dev @applitools/eyes.storybook
```

### Applitools API key

In order to authenticate via the Applitools server, you need to supply the Eyes.Storybook SDK with the API key you got from Applitools. Read more about how to obtain the API key [here](https://applitools.com/docs/topics/overview/obtain-api-key.html).

To to this, set the environment variable `APPLITOOLS_API_KEY` to the API key before running your tests.
For example, on Linux/Mac:

```bash
export APPLITOOLS_API_KEY=<your_key>
```

And on Windows:

```bash
set APPLITOOLS_API_KEY=<your_key>
```

## Usage

After completing the installation and defining the API key, you will be able to run Eyes.Storybook from the command line and let it take screenshots of all your stories.

You should provide the SDK with a URL of a working storybook. It might be a local dev server or a pre-built and deployed production storybook.

### Example

```bash
npx eyes-storybook -u http://localhost:9009
```

## Advanced configuration

It's possible to define the following configuration for tests:

| Property name             | Default value               | Description   |
| -------------             |:-------------               |:-----------   |
| `browser`                 | { width: 800, height: 600, name: 'chrome' } | The size and browser of the generated screenshots. Currently, `firefox` and `chrome` are supported. For more info, see the [browser section below](#configuring-the-browser).|
| `showLogs`                | false                       | Whether or not you want to see logs of the Eyes.Storybook plugin. |
| `saveDebugData`           | false                       | Whether to save troubleshooting data. See the troubleshooting section of this doc for more info. |
| `batchId`                 | random                      | Provides ability to group tests into batches. Read more about batches [here](https://applitools.com/docs/topics/working-with-test-batches/how-to-group-tests-into-batches.html). |
| `batchName`               | undefined                   | Provides a name to the batch. |
| `baselineEnvName`         | undefined                   | The name of the environment of the baseline. |
| `envName`                 | undefined                   | A name for the environment in which the application under test is running. |
| `ignoreCaret`             | false                       | Whether to ignore or the blinking caret or not when comparing images. |
| `matchLevel`              | undefined                   | The test-wide match level to use when checking application screenshot with the expected output. Possible values are `Strict`, `Exact`, `Layout` and `Content`. Read more about match levels [here](http://support.applitools.com/customer/portal/articles/2088359). |
| `matchTimeout`            | undefined                   | Sets the maximum time (in ms) a match operation tries to perform a match. |
| `branchName`              | undefined                   | The name of the branch. |
| `baselineBranchName`      | undefined                   | The name of the baseline branch. |
| `parentBranchName`        | undefined                   | Sets the branch under which new branches are created. |
| `proxy`                   | undefined                   | Sets the proxy settings to be used in network requests to Eyes server. |
| `saveFailedTests`         | false                       | Set whether or not failed tests are saved by default. |
| `saveNewTests`            | false                       | Set whether or not new tests are saved by default. |
| `serverUrl`               | Default Eyes server URL     | The URL of Eyes server |
| `compareWithParentBranch` | false                       |  |
| `ignoreBaseline`          | false                       |  |

There are 2 ways to specify test configuration:
1) Environment variables
2) The `eyes.json` file

The list above is also the order of precedence, which means that if you specify a property as an environment variable, it will override the value defined for the same property in the `eyes.json` file.

### Method 1: Environment variables

The name of the corresponding environment variable is in uppercase, with the `APPLITOOLS_` prefix, and separating underscores instead of camel case:

```js
APPLITOOLS_APP_NAME
APPLITOOLS_SHOW_LOGS
APPLITOOLS_BATCH_NAME
...
// all other configuration variables apply
```

### Method 2: The `eyes.json` file

It's possible to have a file called `eyes.json` at the current working directory (the directory you are at when running the `eyes-storybook` script). In this file specify the desired configuration, in a valid JSON format. For example:

```js
{
  "appName": "My app",
  "showLogs": true,
  "batchName": "My batch"
  ...
  // all other configuration variables apply
}
```

## Configuring the browser

Eyes.Storybook will take a screenshot of the page as specified in the `browser` configuration parameter.

It's also possible to send an array of browsers, for example in the `eyes.json` file:

```js
{
  "browser": [
    {"width": 800, "height": 600, "name": "firefox"},
    {"width": 1024, "height": 768, "name": "chrome"}
  ]
}
```

### Device emulation

To enable chrome's device emulation, it's possible to send a device name and screen orientation, for example:

```js
{
  "browser": {
    "deviceName": 'iPhone X',
    "screenOrientation": 'landscape'
  }
}
```

Possible values for screen orientation are `landscape` and `portrait`, and if no value is specified, the default is `portrait`.

The list of device names is taken from [chrome devtools predefined devices](https://raw.githubusercontent.com/chromium/chromium/0aee4434a4dba42a42abaea9bfbc0cd196a63bc1/third_party/blink/renderer/devtools/front_end/emulated_devices/module.json), and can be obtained by running the following command in a unix-based shell (installing [`jq`](https://stedolan.github.io/jq/) might be needed):

```sh
curl -s https://raw.githubusercontent.com/chromium/chromium/0aee4434a4dba42a42abaea9bfbc0cd196a63bc1/third_party/blink/renderer/devtools/front_end/emulated_devices/module.json | jq '.extensions[].device.title'
```

In addition, it's possible to use chrome's device emulation with custom viewport sizes, pixel density and mobile mode, by passing `deviceScaleFactor` and `mobile` in addition to `width` and `height`. For example:

```js
{
  "browser": {
    "width": 800,
    "height": 600,
    "deviceScaleFactor": 3,
    "mobile": true
  }
}
```

## Troubleshooting

If issues occur, the `saveDebugData` config property can be set to true in order to save helpful information. The information will be saved under a folder named `.applitools` in the current working directory. This could be then used for getting support on your issue.
