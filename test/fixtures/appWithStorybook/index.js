import React from 'react';
import { storiesOf } from '@storybook/react';
import './storybook.css';
import smurfs from '../smurfs.jpg';

storiesOf('Button', module)
  .add('with text', () => (
    <div>with text</div>
  ))
  .add('with some emoji', () => (
    <div>😀 😎 👍 💯</div>
  ));

storiesOf('Image', module)
  .add('image', () => (<React.Fragment>
    <img src="http://localhost:7272/smurfs.jpg" alt="cross origin url"/>
    <img src="smurfs.jpg" alt="relative url"/>
    <img src={smurfs} alt="imported image from code"/>
  </React.Fragment>));

storiesOf('Nested', module)
  .add('story 1', () => <div>story 1</div>);

storiesOf('Nested/Component', module)
  .add('story 1.1', () => <div>story 1.1</div>)
  .add('story 1.2', () => <div>story 1.2</div>);

storiesOf('Component with spaces', module)
  .add('story 1', () => <div>story 1</div>);
  