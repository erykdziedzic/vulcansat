import React from 'react';
import { ThemeProvider } from '@material-ui/core';
import Dashboard from './Dashboard';
import theme from './res/theme';

export default class App extends React.PureComponent {
  render() {
    return (
      <ThemeProvider theme={theme}>
        <Dashboard />
      </ThemeProvider>
    );
  }
}
