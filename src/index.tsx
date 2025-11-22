#!/usr/bin/env node
import { render } from 'ink';
import App from './App.js';

// Render with Ink v4
render(<App />, {
  exitOnCtrlC: false,
  patchConsole: true,
});
