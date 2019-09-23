import { configure } from '@storybook/react';

function loadStories() {
  require('./heavy-storybook.js');
}

configure(loadStories, module);
