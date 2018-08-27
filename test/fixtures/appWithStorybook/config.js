import React from 'react';
import {configure, addDecorator} from '@storybook/react';

addDecorator((story) => <div className="main">{story()}</div>)

function loadStories() {
  require('./index.js');
}

configure(loadStories, module);
