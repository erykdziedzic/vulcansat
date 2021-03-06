import React from 'react';
import { Line, defaults } from 'react-chartjs-2';
import PropTypes from 'prop-types';

const update = [];
defaults.global.animation = false;
export default class Chart extends React.PureComponent {
  render() {
    const { data } = this.props;

    update.push(data.datasets[0].data);

    return (
      <Line
        data={data}
        options={{
          maintainAspectRatio: false,
          scales: {
            yAxes: [{
              scaleLabel: {
                display: true,
                labelString: data.title,
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
                labelString: 'time (s)',
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
  data: PropTypes.shape().isRequired,
};
