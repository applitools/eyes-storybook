import React from 'react';
import {configure, addDecorator} from '@storybook/react';

addDecorator((story) => <div className="main">{story()}</div>)

function loadStories() {
  require('./index.js');
}

if (new URL(window.location).searchParams.get('eyes-storybook') === 'true') {
  document.body.style.backgroundColor = 'tan'
}

configure(loadStories, module);
