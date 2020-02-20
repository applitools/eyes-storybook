# Heavy storybook testkit

This is a heavy storybook that has 1500 stories and includes several resources, as well as 256 images of size 1.5MB.

1. Run `npm run build:heavy` in order to generate the heavy dynamic images

1. To run visual tests on the heavy storybook: `npm run eyes-storybook:heavy`

1. To configure number of stories, change `COUNT` variable in `./heavy-storybook.js`

1. To output log to file:
    * set `showLogs: true` in `applitools.config.js` (or run with APPLITOOLS_SHOW_LOGS=true environment variable)
    * run `npm run test:visual > eyes_heavy.log`
    * recommended to output log file name with story count / features, e.g. `eyes_1000_concurrency_50.log`

1. To just run the storybook (no visual tests, just for inspection): `npm run storybook:heavy`
