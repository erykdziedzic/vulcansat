import React from 'react';
import { Typography } from '@material-ui/core';
import PropTypes from 'prop-types';
import * as colors from './res/colors';
import puszka from './res/puszka2.png';

const styles = {
  container: {
    minWidth: '150px',
    maxWidth: '50%',
    display: 'flex',
    flexDirection: 'column',
    color: 'white',
    position: 'relative',
  },

  title: {
    textAlign: 'center',
    fontSize: '20px',
  },

  chartContainer: {
    height: 'calc(90% - 20px - 12px)',
    width: 'calc(100% - 16px)',
    borderLeft: `2px solid ${colors.orange}`,
    position: 'absolute',
    left: '8px',
    top: 'calc(5% + 20px + 12px)',
  },

  can: {
    width: '24px',
    height: '24px',
    marginLeft: '-12px',
    marginTop: '-12px',
  },

  canContainer: {
    height: '24px',
    marginTop: '-12px',
    position: 'absolute',
    left: '50%',
    display: 'flex',
    flexDirection: 'row',
  },

  canLabel: {
    color: colors.orange, margin: '0 8px', lineHeight: '24px', textAlign: 'center', marginTop: '-12px',
  },

  max: {
    color: colors.orange, position: 'absolute', left: '8px', top: '-8px',
  },

  min: {
    color: colors.orange, position: 'absolute', left: '8px', bottom: '-12px',
  },

  bottomMarker: { width: '4px', height: '3px', backgroundColor: colors.orange },

  marker: {
    width: '4px', height: '2px', marginTop: 'calc(10% + 2px)', backgroundColor: colors.orange,
  },
};

export default class Height extends React.PureComponent {
  render() {
    const { lastHeight, maxHeight } = this.props;

    return (
      <div style={styles.container}>
        <Typography style={styles.title} component="h1">Height</Typography>
        <div style={styles.chartContainer}>
          <div style={{ ...styles.canContainer, top: lastHeight ? `${((maxHeight - lastHeight) / maxHeight) * 100}%` : 0 }}>
            <img src={puszka} alt="puszka" style={styles.can} />
            <Typography style={styles.canLabel}>
              {lastHeight}
            </Typography>
          </div>
          <Typography style={styles.max}>{maxHeight}</Typography>
          <Typography style={styles.min}>0</Typography>
          <div style={styles.bottomMarker} />
          {(new Array(10).fill(0)).map((e, index) => (
            <div key={index.toString()} style={styles.marker} />))}
        </div>
      </div>
    );
  }
}

Height.propTypes = {
  lastHeight: PropTypes.number,
  maxHeight: PropTypes.number,
};

Height.defaultProps = {
  lastHeight: undefined,
  maxHeight: undefined,
};
