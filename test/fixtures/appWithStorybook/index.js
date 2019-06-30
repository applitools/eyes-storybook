import React from 'react';
import { storiesOf } from '@storybook/react';
import './storybook.css';
import smurfs from '../smurfs.jpg';

const isRTL = new URL(window.location).searchParams.get('eyes-variation') === 'rtl';

if (isRTL) {
  document.documentElement.setAttribute('dir', 'rtl')
}

storiesOf('Button', module) .add(undefinedStoryName, () => ( <div style={{ height: '500px', color: 'white' }} /> ));