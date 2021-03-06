import React from 'react';

import { storiesOf } from '@storybook/react';
import { action } from '@storybook/addon-actions';
import { linkTo } from '@storybook/addon-links';

import { Button, Welcome } from '@storybook/react/demo';
import { HScroll } from '../components/HScroll';

import _range from 'lodash/range';

storiesOf('Welcome', module).add('to Storybook', () => <Welcome showApp={linkTo('Button')} />);

storiesOf('Button', module)
  .add('with text', () => <Button onClick={action('clicked')}>Hello Button</Button>)
  .add('with some emoji', () => <Button onClick={action('clicked')}>😀 😎 👍 💯</Button>);

storiesOf('HScroll', module)
  .add('50 lines', () => <HScroll>{_range(50).map((value) => 
    <div key={value}>This is some scrollable content - line #{value + 1}</div>)}</HScroll>)
  .add('250 lines', () => <HScroll>{_range(250).map((value) => 
    <div key={value}>This is some scrollable content - line #{value + 1}</div>)}</HScroll>)