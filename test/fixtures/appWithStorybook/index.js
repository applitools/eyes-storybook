import React from 'react';
import { storiesOf } from '@storybook/react';
import './storybook.css';

storiesOf('Button', module)
  .add('with text', () => (
    <div>with text</div>
  ))
  .add('with some emoji', () => (
    <div>😀 😎 👍 💯</div>
  ));

storiesOf('Image', module)
  .add('image', () => (
    <img src="http://localhost:7272/smurfs.jpg"/>
  ));

storiesOf('Nested', module)
  .add('story 1', () => <div>story 1</div>);

storiesOf('Nested/Component', module)
  .add('story 1.1', () => <div>story 1.1</div>)
  .add('story 1.2', () => <div>story 1.2</div>);

