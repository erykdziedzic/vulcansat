import React from 'react';
import { Button, Typography, Checkbox } from '@material-ui/core';
import GoogleMap from 'google-map-react';
import socketIOClient from 'socket.io-client';
import Chart from './Chart';
import Height from './Height';
import * as colors from './res/colors';
import logo from './res/logo.png';
import puszka from './res/puszka2.png';
import pencil from './res/pencil.png';
import theme from './res/theme';

import percent20 from './res/20.png';
import percent40 from './res/40.png';
import percent60 from './res/60.png';
import percent80 from './res/80.png';
import percent100 from './res/100.png';

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'flex-start',
  },

  sideBar: {
    margin: '0px',
    backgroundColor: colors.darkGrey,
    height: '100vh',
    minWidth: '150px',
    maxWidth: '15vw',
    display: 'flex',
    flexDirection: 'column',
  },

  leftBar: {
    borderRightStyle: 'solid',
    borderRightWidth: '2px',
    borderRightColor: colors.orange,
    alignItems: 'spaceAround',
  },

  rightBar: {
    borderLeftStyle: 'solid',
    borderWidth: '2px',
    borderLeftColor: colors.orange,
    alignItems: 'spaceAround',
  },


  sideBarHalf: {
    width: '100%',
    height: '50%',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    overflowY: 'hidden',
  },

  leftBarSeparator: {
    width: '100%',
    height: '2px',
    backgroundColor: colors.orange,
  },

  logoContainer: {
    display: 'flex',
    justifyContent: 'center',
    padding: '8px',
  },

  logo: {
    width: '90%',
  },

  controlButtonsContainer: {
    marginTop: '8px',
    display: 'flex',
    width: '100%',
    justifyContent: 'space-around',
  },

  recordInfo: {
    marginTop: '8px',
    color: 'white',
    display: 'flex',
    alignItems: 'center',
    flexDirection: 'column',
  },

  middle: {
    flexGrow: 1,
    height: '100vh',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'flex-end',
  },

  bottomBar: {
    width: '100%',
    height: '30vh',
    margin: '0px',
    backgroundColor: colors.darkGrey,
    borderTopStyle: 'solid',
    boderTopWidth: '2px',
    borderTopColor: colors.orange,
    display: 'flex',
    flexDirection: 'row',
  },

  bottomBarSeparator: {
    width: '2px',
    height: '100%',
    backgroundColor: colors.orange,
  },

  bottomBarLeft: {
    minWidth: '150px',
    maxWidth: '50%',
    display: 'flex',
    flexDirection: 'column',
    color: 'white',
    position: 'relative',
  },

  batteryContainer: {

  },

  bottomBarRight: {
    minWidth: '150px',
    flexGrow: 1,
    height: '100%',
  },

  dashboardContainer: {
    display: 'flex',
    justifyContent: 'flex-start',
    alignItems: 'center',
    height: '100%',
    width: '100%',
    backgroundColor: colors.darkGrey,
    flexDirection: 'column ',
  },

  dashboard: {
    height: '95%',
    width: '95%',
    backgroundColor: colors.darkGrey,
  },

  chart: {
    flex: 1,
    width: '100%',
  },

  recordDataTitle: {
    textAlign: 'center',
    fontSize: '20px',
  },

  recordDataItem: {
    marginLeft: '8px',
    marginTop: '8px',
  },

  dot: {
    width: '4px', height: '4px', borderRadius: '2px', backgroundColor: '#c20000',
  },
};

const datasetOptions = (label, color) => ({
  label,
  fill: false,
  lineTension: 0.1,
  backgroundColor: theme.palette.background.default,
  borderColor: color,
  borderCapStyle: 'butt',
  borderDash: [],
  borderDashOffset: 0.0,
  borderJoinStyle: 'miter',
  pointBorderColor: color,
  pointBackgroundColor: '#fff',
  pointBorderWidth: 1,
  pointHoverRadius: 5,
  pointHoverBackgroundColor: color,
  pointHoverBorderColor: 'rgba(220,220,220,1)',
  pointHoverBorderWidth: 2,
  pointRadius: 1,
  pointHitRadius: 10,
});

function getRandomColor() {
  const letters = '0123456789ABCDEF';
  let color = '#';
  for (let i = 0; i < 6; i += 1) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
}

const getRecordTitle = (num) => {
  const now = new Date();
  return `record_${num}_${now.getDate()}.${now.getMonth() < 10 ? `0${now.getMonth()}` : now.getMonth()}.${now.getFullYear()}`;
};

const MapMarkerBig = (lat, lng) => (
  <img
    alt="puszka"
    src={puszka}
    lat={lat}
    lng={lng}
    style={{
      width: '20px', height: '20px', tintColor: 'red', marginLeft: '-10px', marginTop: '-10px',
    }}
  />
);

const MapMarker = (lat, lng) => (<div lat={lat} lng={lng} style={styles.dot} />);

const chartLabels = ['temperatureDS', 'temperatureBMP', 'pressureBMP', 'altitudeBMP'];

let startSecond = 0;

class Dashboard extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      recording: false,
      records: [],
      charts: [],
      currentRecord: undefined,
    };
  }

  async componentDidMount() {
    const records = await fetch('/record').then((res) => res.json());
    if (records !== '[]') this.setState({ records });
  }

  async addRecord(record) {
    await fetch('/record', {
      method: 'POST',
      body: JSON.stringify(record),
      headers: {
        'Content-Type': 'application/json',
      },
    });
    const records = await fetch('/record').then((res) => res.json());
    if (records !== '[]') this.setState({ records });
  }

  async renameRecord(oldName, newName) {
    await fetch('/record/rename', {
      method: 'POST',
      body: JSON.stringify({ old: oldName, new: newName }),
      headers: {
        'Content-Type': 'application/json',
      },
    });
    const records = await fetch('/record').then((res) => res.json());
    if (records !== '[]') this.setState({ records });
  }

  parseIncomingData(incoming) {
    const { recording: recordingNow, charts: chartsNow } = this.state;

    if (recordingNow) {
      const currentTime = (incoming.hour * 60 * 60 + incoming.minute * 60 + incoming.second);
      if (chartsNow.length === 0) startSecond = currentTime;
      const newCharts = [];
      Object.keys(incoming).forEach((key) => {
        let newChart = chartsNow.find((chart) => chart.title === key);
        if (!newChart) {
          if (chartLabels.includes(key)) {
            newChart = {
              title: key,
              color: getRandomColor(),
              labels: [(currentTime - startSecond).toString()],
              datasets: [{ data: [incoming[key]] }],
            };
          } else {
            newChart = {
              title: key,
              data: [incoming[key]],
            };
          }
        } else if (chartLabels.includes(key)) {
          const tempData = [...newChart.datasets[0].data];
          tempData.push(incoming[key]);
          const tempDataset = newChart.datasets[0];
          tempDataset.data = tempData;
          newChart.datasets = [tempDataset];
          newChart.labels.push((currentTime - startSecond).toString());
        } else {
          const tempData = [...newChart.data];
          tempData.push(incoming[key]);
          newChart.data = tempData;
        }
        newCharts.push(newChart);
      });
      this.setState({ charts: [...newCharts] });
    } else {
      this.socket.close();
    }
  }

  stopRecording() {
    this.setState({
      recording: false,
      charts: [],
      currentRecord: undefined,
    });
  }

  render() {
    const {
      recording, records, charts, currentRecord,
    } = this.state;

    const recordList = records.map((record, idx) => (
      <div style={{ flexDirection: 'row', display: 'flex' }}>
        <div
          key={idx.toString()}
          onClick={() => {
            if (charts.length > 0 && recording) {
              this.addRecord({ title: getRecordTitle(records.length), charts });
              this.setState({
                charts: record.charts,
                recording: false,
                currentRecord: record.title,
              });
            } else {
              this.setState({
                charts: record.charts,
                recording: false,
                currentRecord: record.title,
              });
            }
          }}
          role="button"
          tabIndex={idx}
          onKeyPress={() => {}}
        >
          <Typography
            variant="h6"
            component="h1"
            style={{ marginTop: '8px', color: 'white' }}
          >
            {record.title}
          </Typography>
        </div>
        <div role="button" onClick={() => {}} onKeyPress={() => {}} tabIndex={records.length + idx} style={{ marginTop: '8px', marginLeft: '4px' }}>
          <img style={{ width: '24px', height: '24px' }} src={pencil} alt="edit" />
        </div>
      </div>
    ));

    const heightChart = charts.find((chart) => chart.title === 'altitudeBMP');
    let lastHeight;
    let maxHeight;
    if (heightChart) {
      lastHeight = heightChart.datasets[0].data[heightChart.datasets[0].data.length - 1];
      maxHeight = Math.max(...heightChart.datasets[0].data);
    }

    return (
      <div style={styles.container}>
        <div style={{ ...styles.sideBar, ...styles.leftBar }}>
          <div style={styles.sideBarHalf}>
            <div style={styles.logoContainer}>
              <img src={logo} alt="" style={styles.logo} />
            </div>
            <div style={styles.controlButtonsContainer}>
              <Button
                variant="contained"
                color="primary"
                onClick={() => {
                  if (!recording) {
                    this.setState({ charts: [], currentRecord: getRecordTitle(records.length) });
                    this.socket = socketIOClient('http://127.0.0.1:5000');
                    this.socket.on('data', (incoming) => this.parseIncomingData(incoming));
                    this.setState({ recording: true });
                  } else if (charts.length > 0) {
                    this.addRecord({ title: getRecordTitle(records.length), charts });
                    this.stopRecording();
                  } else {
                    this.stopRecording();
                  }
                }}
              >
                {recording ? 'STOP' : 'START'}
              </Button>
            </div>
            <div style={styles.recordInfo}>
              <Typography variant="h6" component="h1">Current record: </Typography>
              <Typography component="p" style={{ textAlign: 'center' }}>{currentRecord}</Typography>
            </div>
            <div style={{ width: '60%', height: '2px', backgroundColor: colors.orange }} />
            <div style={styles.recordInfo}>
              <Typography variant="h6" component="h1">Stage 3: falling</Typography>
            </div>
          </div>
          <div style={styles.leftBarSeparator} />
          <div style={styles.sideBarHalf}>
            {recordList}
          </div>
        </div>
        <div style={styles.middle}>
          <div style={styles.dashboardContainer}>
            {charts.filter((chart) => chartLabels.includes(chart.title)).map((data) => {
              const randomChart = {
                ...data,
                animation: false,
                responsive: false,
                datasets: [
                  {
                    ...datasetOptions(data.title, data.color),
                    data: data.datasets[0].data,
                  },
                ],
              };
              return (
                <div style={styles.chart}>
                  <Chart data={randomChart} />
                </div>
              );
            })}
          </div>
          <div style={styles.bottomBar}>
            <div style={styles.bottomBarLeft}>
              <Typography style={styles.recordDataTitle} component="h1">Latest</Typography>
              {charts.filter((chart) => chartLabels.includes(chart.title)).map((chart) => {
                const title = chart.title[0].toUpperCase() + chart.title.slice(1);
                return (
                  <Typography style={styles.recordDataItem} component="p">{`${title}: ${chart.datasets[0].data[chart.datasets[0].data.length - 1]}`}</Typography>
                );
              })}
            </div>
            <div style={styles.bottomBarSeparator} />
            <div style={{
              ...styles.bottomBarLeft, display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '8px 0',
            }}
            >
              <img src={percent20} alt="battery" style={{ width: 'auto', height: '100%' }} />
            </div>
            <div style={styles.bottomBarSeparator} />
            <div style={styles.bottomBarRight}>
              <GoogleMap
                bootstrapURLKeys={{ key: 'AIzaSyAsxaRYSOoaV_1cDYnrzhYpdjnGr9i2Gx8' }}
                defaultCenter={{ lat: 50.047, lng: 19.920 }}
                defaultZoom={16}
              >
                {charts.find((chart) => chart.title === 'latitudeGPS')
                  ? charts.find((chart) => chart.title === 'latitudeGPS').data.map((lat, idx) => {
                    const lng = charts.find((chart) => chart.title === 'longitudeGPS').data[idx];
                    if (idx === charts.find((chart) => chart.title === 'latitudeGPS').data.length - 1) {
                      return (<MapMarkerBig lat={lat} lng={lng} />);
                    }
                    return (<MapMarker lat={lat} lng={lng} />);
                  })
                  : undefined}
              </GoogleMap>
            </div>

            <div style={styles.bottomBarSeparator} />
            <Height lastHeight={lastHeight} maxHeight={maxHeight} />
          </div>
        </div>
      </div>
    );
  }
}

export default Dashboard;
