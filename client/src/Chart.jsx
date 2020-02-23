import React from 'react';
import { Line, defaults } from 'react-chartjs-2';
import PropTypes from 'prop-types';

defaults.global.animation = false;
export default class Chart extends React.PureComponent {
  render() {
    const { data } = this.props;

    return (
      <Line
        data={data}
        options={{
          maintainAspectRatio: false,
          scales: {
            yAxes: [{
              scaleLabel: {
                display: true,
                labelString: 'temperature',
              },
            }],
            xAxes: [{
              ticks: {
                autoSkip: true,
                max: 3,
                min: 0,
                stepSize: 15,
              },
              scaleLabel: {
                display: true,
                labelString: 'time',
              },
            }],

          },
        }}
        redraw
      />
    );
  }
}

Chart.propTypes = {
  data: PropTypes.arrayOf(PropTypes.number).isRequired,
};
