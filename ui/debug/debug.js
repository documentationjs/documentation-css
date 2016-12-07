import React from 'react';
import ReactDOM from 'react-dom';
import { Loader } from '../lib/loader';

const container = document.createElement('div');
document.body.appendChild(container);

ReactDOM.render(<Loader file='debug/debug.css' />, container);
