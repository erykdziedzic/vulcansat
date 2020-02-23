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
  },

  dashboard: {
    height: '95%',
    width: '95%',
    backgroundColor: colors.darkGrey,
  },

  recordDataItem: {
    marginLeft: '8px',
    marginTop: '8px',
  },

  chart: {
    width: '100%',
    height: '100%',
  },

  dot: {
    width: '4px', height: '4px', borderRadius: '2px', backgroundColor: '#c20000',
  },
};

const record = 'record_1 - 01.12.2019';
const recordList = ['record_1', 'record_2', 'record_3'].map((title) => (
  <Typography
    variant="h6"
    component="h1"
    style={{ marginTop: '8px', color: 'white' }}
  >
    {title}
  </Typography>
));

const graphList = ['temperature', 'height', 'costam', 'costaminnego'];

const recordData = {
  height: '100m',
  temperature: '24C',
  costam: 'hehe',
};

class Dashboard extends React.PureComponent {
  constructor(props) {
    super(props);
    this.socket = socketIOClient('http://127.0.0.1:8080');
    this.state = {
      index: 0,
      change: false,
      recording: false,
      data: {
        animation: false,
        responsive: false,
        labels: [],
        datasets: [
          {
            label: 'BMP280',
            fill: false,
            lineTension: 0.1,
            backgroundColor: theme.palette.background.default,
            borderColor: 'rgba(75,192,192,1)',
            borderCapStyle: 'butt',
            borderDash: [],
            borderDashOffset: 0.0,
            borderJoinStyle: 'miter',
            pointBorderColor: 'rgba(75,192,192,1)',
            pointBackgroundColor: '#fff',
            pointBorderWidth: 1,
            pointHoverRadius: 5,
            pointHoverBackgroundColor: 'rgba(75,192,192,1)',
            pointHoverBorderColor: 'rgba(220,220,220,1)',
            pointHoverBorderWidth: 2,
            pointRadius: 1,
            pointHitRadius: 10,
            data: [],
          },
        ],
      },
    };
  }

  componentDidUpdate() {
    const { data, recording } = this.state;

    if (recording) {
      console.log('Recording');
      this.socket = socketIOClient('http://127.0.0.1:8080');
      this.socket.on('data', (press) => {
        const { change, index } = this.state;
        data.labels.push(index.toString());
        this.setState({ change: !change, index: index + 1 });
        data.datasets[0].data.push(Number(press.press));
      });
    } else {
      this.socket.close();
    }
  }

  render() {
    const { recording, data } = this.state;

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
                onClick={() => { this.setState({ recording: !recording }); }}
              >
                {recording ? 'STOP' : 'START'}
              </Button>
            </div>
            <div style={styles.recordInfo}>
              <Typography variant="h6" component="h1">Current record: </Typography>
              <Typography component="p" style={{ textAlign: 'center' }}>{record}</Typography>
            </div>
          </div>
          <div style={styles.leftBarSeparator} />
          <div style={styles.sideBarHalf}>
            {recordList}
          </div>
        </div>
        <div style={styles.middle}>
          <div style={styles.dashboardContainer}>
            <div style={styles.dashboard}>
              <Chart data={data} style={styles.chart} />
            </div>
          </div>
          <div style={styles.bottomBar}>
            <div style={styles.bottomBarLeft}>
              <Typography style={styles.recordDataItem} component="p">
                {`Temperature: ${recordData.temperature}`}
              </Typography>
            </div>
            <div style={styles.bottomBarSeparator} />
            <div style={styles.bottomBarRight}>
              <GoogleMapReact
                bootstrapURLKeys={{ key: 'AIzaSyAsxaRYSOoaV_1cDYnrzhYpdjnGr9i2Gx8' }}
                defaultCenter={{ lat: 50.047, lng: 19.920 }}
                defaultZoom={16}
              >
                <div lat={50.047118} lng={19.920463} style={styles.dot} />
                <div lat={50.0470} lng={19.9205} style={styles.dot} />
                <div lat={50.0469} lng={19.9206} style={styles.dot} />
                <div lat={50.0468} lng={19.9206} style={styles.dot} />
                <div lat={50.0467} lng={19.9207} style={styles.dot} />
                <div lat={50.0466} lng={19.9207} style={styles.dot} />
                <div lat={50.0465} lng={19.9208} style={styles.dot} />
                <div lat={50.0464} lng={19.9209} style={styles.dot} />
                <div lat={50.0463} lng={19.9209} style={styles.dot} />
                <div lat={50.046277} lng={19.921075} style={styles.dot} />
                <img
                  alt="crosshair"
                  src={crosshair}
                  lat={50.046277}
                  lng={19.921075}
                  style={{ width: '20px', height: '20px', tintColor: 'red' }}
                />
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
