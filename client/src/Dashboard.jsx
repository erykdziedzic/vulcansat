import React from 'react';
import { Button, Typography, Checkbox } from '@material-ui/core';
import GoogleMapReact from 'google-map-react';
import socketIOClient from 'socket.io-client';
import Chart from './Chart';
import * as colors from './res/colors';
import logo from './res/logo.png';
import crosshair from './res/crosshair-red.png';
import theme from './res/theme';

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


class Dashboard extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      index: 0,
      recording: false,
      records: [],
      charts: [],
      currentRecord: undefined,
    };
  }

  render() {
    const {
      recording, records, charts, index, currentRecord,
    } = this.state;

    const recordList = records.map((record, idx) => (
      <div
        onClick={() => {
          if (charts.length > 0 && recording) {
            const now = new Date();
            const title = `record_${records.length}_${now.getDate()}.${now.getMonth() < 10 ? `0${now.getMonth()}` : now.getMonth()}.${now.getFullYear()}`;
            this.setState({
              records: [...records, { title, charts }],
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
        onKeyPress={(e) => console.log(e)}
      >
        <Typography
          variant="h6"
          component="h1"
          style={{ marginTop: '8px', color: 'white' }}
        >
          {record.title}
        </Typography>
      </div>
    ));

    let lastHeight;
    let maxHeight;
    const heightChart = charts.find((chart) => chart.title === 'height');
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
                    const now = new Date();
                    const title = `record_${records.length}_${now.getDate()}.${now.getMonth() < 10 ? `0${now.getMonth()}` : now.getMonth()}.${now.getFullYear()}`;

                    this.setState({ charts: [], currentRecord: title });
                    this.socket = socketIOClient('http://127.0.0.1:8080');
                    this.socket.on('data', (incoming) => {
                      const { index, recording: recordingNow, charts: chartsNow } = this.state;

                      if (recordingNow) {
                        const newCharts = [];
                        Object.keys(incoming).forEach((key) => {
                          let newChart = chartsNow.find((chart) => chart.title === key);
                          if (!newChart) {
                            if (key === 'position') {
                              newChart = {
                                title: key,
                                data: [incoming[key]],
                              };
                            } else {
                              newChart = {
                                title: key,
                                animation: false,
                                responsive: false,
                                labels: [index.toString()],
                                datasets: [
                                  {
                                    ...datasetOptions(key, getRandomColor()),
                                    data: [incoming[key]],
                                  },
                                ],
                              };
                            }
                          } else if (key === 'position') {
                            const tempData = [...newChart.data];
                            tempData.push(incoming[key]);
                            newChart.data = tempData;
                          } else {
                            const tempData = [...newChart.datasets[0].data];
                            tempData.push(incoming[key]);
                            const tempDataset = newChart.datasets[0];
                            tempDataset.data = tempData;
                            newChart.datasets = [tempDataset];
                            newChart.labels.push(index.toString());
                          }
                          newCharts.push(newChart);
                        });
                        this.setState({ charts: [...newCharts], index: index + 1 });
                      } else {
                        this.socket.close();
                      }
                    });
                    this.setState({ recording: true });
                  } else if (charts.length > 0) {
                    const now = new Date();
                    const title = `record_${records.length}_${now.getDate()}.${now.getMonth() < 10 ? `0${now.getMonth()}` : now.getMonth()}.${now.getFullYear()}`;

                    this.setState({
                      recording: false,
                      records: [...records, { title, charts }],
                      charts: [],
                      currentRecord: undefined,
                    });
                  } else {
                    this.setState({
                      recording: false,
                      charts: [],
                      currentRecord: undefined,
                    });
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
          </div>
          <div style={styles.leftBarSeparator} />
          <div style={styles.sideBarHalf}>
            {recordList}
          </div>
        </div>
        <div style={styles.middle}>
          <div style={styles.dashboardContainer}>
            {charts.filter((chart) => chart.title !== 'position').map((data) => (
              <div style={styles.chart}>
                <Chart data={data} />
              </div>
            ))}
          </div>
          <div style={styles.bottomBar}>
            <div style={styles.bottomBarLeft}>
              <Typography style={styles.recordDataTitle} component="h1">Latest</Typography>
              {charts.filter((chart) => chart.title !== 'position').map((chart) => {
                const title = chart.title[0].toUpperCase() + chart.title.slice(1);
                return (
                  <Typography style={styles.recordDataItem} component="p">{`${title}: ${chart.datasets[0].data[chart.datasets[0].data.length - 1]}`}</Typography>
                );
              })}
            </div>
            <div style={styles.bottomBarSeparator} />
            <div style={styles.bottomBarLeft}>
              <Typography style={styles.recordDataTitle} component="h1">Height</Typography>
              <div style={{
                height: 'calc(90% - 20px)', width: 'calc(100% - 16px)', borderLeft: `2px solid ${colors.orange}`, position: 'absolute', left: '8px', top: 'calc(5% + 20px)',
              }}
              >
                <div style={{
                  width: '4px',
                  height: '4px',
                  marginLeft: '-2px',
                  marginTop: '-2px',
                  backgroundColor: colors.orange,
                  position: 'absolute',
                  left: '50%',
                  borderRadius: '2px',
                  top: lastHeight ? `${(maxHeight - lastHeight) / maxHeight * 100}%` : 0,
                }}
                />
                <Typography style={{
                  color: colors.orange, position: 'absolute', left: '8px', top: '-8px',
                }}
                >
                  {maxHeight}
                </Typography>
                <Typography style={{
                  color: colors.orange, position: 'absolute', left: '8px', bottom: '-12px',
                }}
                >
0
                </Typography>
                <div style={{ width: '4px', height: '3px', backgroundColor: colors.orange }} />
                {(new Array(10).fill(0)).map(() => (
                  <div style={{
                    width: '4px', height: '2px', marginTop: 'calc(10% + 2px)', backgroundColor: colors.orange,
                  }}
                  />
                ))}
              </div>
            </div>
            <div style={styles.bottomBarSeparator} />
            <div style={styles.bottomBarRight}>
              <GoogleMapReact
                bootstrapURLKeys={{ key: 'AIzaSyAsxaRYSOoaV_1cDYnrzhYpdjnGr9i2Gx8' }}
                defaultCenter={{ lat: 50.047, lng: 19.920 }}
                defaultZoom={16}
              >
                {charts.find((chart) => chart.title === 'position')
                  ? charts.find((chart) => chart.title === 'position').data.map((data, idx) => {
                    if (idx === charts.find((chart) => chart.title === 'position').data.length - 1) {
                      return (
                        <img
                          alt="crosshair"
                          src={crosshair}
                          lat={data.lat}
                          lng={data.lng}
                          style={{
                            width: '20px', height: '20px', tintColor: 'red', marginLeft: '-10px', marginTop: '-10px',
                          }}
                        />
                      );
                    }
                    return (<div lat={data.lat} lng={data.lng} style={styles.dot} />);
                  })
                  : undefined}
              </GoogleMapReact>
            </div>
          </div>
        </div>
        {/* <div style={{ ...styles.sideBar, ...styles.rightBar }}> */}
        {/*   <div style={styles.sideBarHalf}> */}
        {/*     {graphList.map((item) => ( */}
        {/*       <div style={{ */}
        {/*         display: 'flex', color: 'white', alignItems: 'center', */}
        {/*       }} */}
        {/*       > */}
        {/*         <Typography style={{ width: '100px' }} component="p">{item}</Typography> */}
        {/*         <Checkbox color="primary" /> */}
        {/*       </div> */}
        {/*     ))} */}
        {/*   </div> */}
        {/*   <div style={styles.leftBarSeparator} /> */}
        {/*   <div style={styles.sideBarHalf} /> */}
        {/* </div> */}
      </div>
    );
  }
}

export default Dashboard;
