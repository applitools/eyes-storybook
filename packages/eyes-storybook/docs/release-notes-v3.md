# Release notes for version 3

This version contains many improvements to the Eyes-Storybook SDK. It includes monumental performance optimizations, a smaller memory footprint, and many new features.

Due to the optimization, there might be slight differences in the output results. This post aims to clarify under what conditions these differences are expected to happen, and how to remediate the situation.

## Index

- [Performance optimizations](#performance-optimizations)
  - [Using Storybook's Client API](#1-using-storybooks-client-api)
  - [Caching the DOM snapshot](#2-caching-the-DOM-snapshot)
  - [Single step tests](#3-single-step-tests)
  - [Memory footprint](#4-memory-footprint)
- [New features](#new-features)
  - [Interaction support (`runBefore`)](#interaction-support-runbefore)
  - [Per component `waitBeforeScreenshot`](#per-component-waitbeforescreenshot)
  - [New config parameter- `readStoriesTimeout`](#new-config-parameter-readstoriestimeout)

## Performance optimizations

### 1. Using Storybook's Client API

Here's the way Eyes-Storybook works: It launches a browser via Puppeteer, navigates to storybook's URL (that's either provided or by spinning up a storybook dev server locally), then it gets the list of stories from the storybook page. Then next step is to open a few browser tabs, and use them to iterate through all the stories. For each story, it extracts the information for the page, and then it runs the visual diff in the background by communicating with Applitools servers.

The bottleneck for this process is how we iterate through the stories. Up until version 2, we would reload the browser tab with a new URL that directly loads the story. This proved to show slow results, as navigation could easily take up to a few seconds. Even in the best case it takes around 0.5 second to load the page. Since this time cannot be done in parallel across all stories, the rate at which we run the stories is governed by this number. So a 1000 story storybook would take at least ~900 seconds to run (15 minutes).

We improved this by resorting to use Storybook's built-in Client API, which allows us to programatically render a story without reloading or navigating the page. The rendering occurs instantly (synchronously) and then we just need to wait for the story to stabilize in case there is fetching of resources, timers or animation. This drastically improved run time - we're now able to grock through 1000 stories instantly, and with normal stabilization time of 100-200 milliseconds (ms), this means ~150 seconds (~2.5 minutes).

#### Possible break of existing behaviour

The implication of this optimization is that the page isn't reloaded between stories, therefore "garbage" might accumulate across stories, or the state might be inconsistent. There are several possible situations this may happen:

1. The stories share a state object (e.g. a **single redux store**, or the **DOM**) and don't clean it up on unmount.
2. The stories are dependent on browser load events.

These are bad practices in general, as these situations will lead to malformed stories also in the case that a user navigates through stories by clicking on names of stories in the sidebar. That scenario uses the same Storybook Client API that Eyes-Storybook uses. So the results Eyes-Storybook now outputs resemble what the user would see if they navigated the stories this way, rather than load up stories through direct URL's.

The way to remediate this situation is to either **opt out of the optimization** and thereby instruct Eyes-Storybook to reload each page. This is done by setting the configuration parameter `reloadPagePerStory` to `true`.

Another way to handle this is to change the way stories are written. This may be difficult or even impossible to do for well established large codebases of storybook. But it should prove worthwhile in the long run as it avoid spaghetti code inside storybook.

### 2. Caching the DOM snapshot

Another part of taking a screenshot of each story is to extract a DOM snapshot once the story's UI is ready. This may be a relatively lengthy process, especially for stories rich with resources such as images, fonts, etc.
To understand the impact of DOM snapshot run time on the entire execution, let's consider for example a DOM snapshot takes 0.2 seconds (200 ms). This is done serially across stories, and in parallel on the open puppeteer tabs. We have 3 tabs, so for 1200 stories, each tab processes 400 stories, so 400 * 0.2 is 80 seconds. If we cut this to 0.05 seconds (50 ms) we get only 20 seconds.
This is what we did. To minimize the time it takes for DOM snapshotting, we maintain a cache in-browser for all the resources.

### 3. Single step tests

The last part of the performance optimization has to do with the communication with Applitools' Eyes server. That's the server that performs the actual image comparison algorithms. Normally, Applitools tests are a series of ordered images. This is what makes us capable of providing information about missing or additional images, in addition to showing a visual diff for existing images.
Under those terms, there are at least 3 requests to the server: (a) start test, (b) match screenshot, and (c) end test.
Eyes-Storybook is different in this aspect, in that for every story in storybook an Applitools test is created. Since this is the case, a test can be communicated in a single request to the server, and the server also has lots of optimizations to do. For large storybooks with thousands of stories and a configuration of several browsers with several viewport sizes, this means saving tens of thousands of HTTP requests.

### 4. Memory footprint

We've also observed the memory consumption of Eyes-Storybook's heap, and have seen it rise to high peaks. We solved this in 2 ways:

1) We employ constraints on the rate of sub-processes that accumulate data, thereby avoiding unnecessary data to be saved in RAM.
2) The data necessary for the SDK's execution is saved in Node.js Buffers rather than as JavaScript objects. So data is saved in an external space, rather than just the heap. This makes the entire virtual memory of the process available, as opposed to the default 1.5GB of the heap.

Even though 1.5GB sounds like much, a simple calculation shows it's within logical boundaries. For a storybook that contains 6000 stories, we may need to hold 250 KB worth of data in RAM, which is exactly 1.5 GB.

## New features

### Interaction support (`runBefore`)

It's now possible to perform interaction with the story's UI before taking a snapshot of the page.

From the docs:

> `runBefore` is an asynchronous function that will be evaluated before the story's screenshot is taken. This is the place to perform any interaction with the story using DOM API's.
>
> For performing various DOM interactions, we recommend checking out [dom-testing-library](https://github.com/testing-library/dom-testing-library). It provides utilities to interact, query and wait for conditions on the DOM.
>
> For example, a component that renders a popover could trigger the opening of the popover and wait for content to appear:
>
> ```js
> // these are utilities from dom-testing-library
> import {wait, within, fireEvent} from '@testing-library/dom';
>
> // <Popover /> is a component in your UI library.
> // The assumption in this example is that it is opened by an element with the text 'Open',
> // and then that element's text changes to 'Close':
> storiesOf('UI components', module)
>   .add('Popover', () => <Popover />, {
>     eyes: {
>       runBefore({rootEl, story}) {
>         fireEvent.click(within(rootEl).getByText('Open'))
>         return wait(() => within(rootEl).getByText('Close'))
>       }
>     },
>   })
> ```

### Per component `waitBeforeScreenshot`

This ability was available as a global configuration parameter, but it's now also available per story.

From the docs:

> Selector or timeout, see [advanced configuration](#advanced-configuration) for more details.
>
> ```js
> storiesOf('Components with a waitBeforeScreenshot', module)
>   .add(
>     'Some story',
>     () => <span id="container" class="loading"></span>,
>     {eyes: { waitBeforeScreenshot: '#container.ready' }}
>   );
> ```
>
> _Note that the predicate option for `waitBeforeScreenshot` is currently not available in the per component configuration._

### New config parameter- `readStoriesTimeout`

If storybook takes a long time to load, use this parameter to increase the time Eyes-Storybook waits.

From the docs:

> The amount of time (in milliseconds) Eyes-Storybook waits for storybook to load. For old storybook versions 2 and 3, this is also the time it takes for Eyes-Storybook to acknowledge it is working on those versions. So it is recommended to make this value small (e.g. 3000) when working with Storybook version 2 or 3.
